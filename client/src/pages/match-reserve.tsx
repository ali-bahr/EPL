import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Loader2, CheckCircle, Ticket } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { SeatMap } from "@/components/seat-map";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { connectToMatchSeats, disconnectSocket, type SeatData } from "@/lib/socket";
import type { MatchWithStadium } from "@shared/schema";
import { format } from "date-fns";
import { matchApi } from "@/lib/api";
import { adaptMatch, type ApiMatch } from "@/lib/match-adapter";

const paymentSchema = z.object({
  creditCardNumber: z.string().length(16, "Card number must be 16 digits").regex(/^\d+$/, "Only digits allowed"),
  pinNumber: z.string().min(4, "PIN must be at least 4 digits").regex(/^\d+$/, "Only digits allowed"),
});

type PaymentForm = z.infer<typeof paymentSchema>;

interface ReservationResult {
  ticketNumber: string;
  id: string;
  seatRow: number;
  seatNumber: number;
}

export default function MatchReserve() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSeat, setSelectedSeat] = useState<{ row: number; seat: number; id: string } | null>(null);
  const [reservedSeats, setReservedSeats] = useState<Array<{ row: number; seat: number }>>([]);
  const [allSeats, setAllSeats] = useState<SeatData[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string>("");

  const { data: match, isLoading } = useQuery<MatchWithStadium | null>({
    queryKey: ["/api/v1/Match", id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) return null;
      const response = await matchApi.getById(id) as any;
      console.log("Match API Response:", response);
      // API might return {success, data: match} or just the match
      const matchData = response?.data || response;
      return adaptMatch(matchData);
    },
  });

  // Setup WebSocket for real-time seat updates
  useEffect(() => {
    if (!id) return;

    const handleSeatUpdate = (seats: SeatData[]) => {
      console.log("Seat update received, total seats:", seats.length);
      
      // Store all seats with their IDs
      setAllSeats(seats);
      
      // Convert WebSocket data to the format used by the component
      const reserved = seats
        .filter(seat => seat.isReserved)
        .map(seat => ({ row: seat.rowNumber, seat: seat.seatNumber }));
      
      console.log("Reserved seats:", reserved.length);
      setReservedSeats(reserved);
      
      // Clear selected seat if it becomes reserved
      if (selectedSeat) {
        const isSelectedReserved = reserved.some(reservedSeat => 
          reservedSeat.row === selectedSeat.row && reservedSeat.seat === selectedSeat.seat
        );
        if (isSelectedReserved) {
          setSelectedSeat(null);
          toast({
            title: "Seat Reserved",
            description: "The seat you selected was just reserved by someone else. Please select another seat.",
            variant: "destructive",
          });
        }
      }
    };

    // Connect to WebSocket
    console.log("Connecting to WebSocket for match:", id);
    connectToMatchSeats(id, handleSeatUpdate);

    // Cleanup
    return () => {
      console.log("Disconnecting WebSocket");
      disconnectSocket();
    };
  }, [id, selectedSeat, toast]);

  // Initialize reserved seats from match data
  useEffect(() => {
    if (match?.reservedSeats) {
      setReservedSeats(match.reservedSeats);
    }
  }, [match?.reservedSeats]);

  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      creditCardNumber: "",
      pinNumber: "",
    },
  });

  const reserveMutation = useMutation({
    mutationFn: async (data: PaymentForm) => {
      if (!selectedSeat) {
        throw new Error("No seat selected");
      }

      if (!id) {
        throw new Error("Match ID not found");
      }

      // Use stored seat ID or lookup from WebSocket data
      let seatId = selectedSeat.id;
      
      if (!seatId) {
        // Fallback: try to find in allSeats if not stored
        const seatData = allSeats.find(
          s => s.rowNumber === selectedSeat.row && s.seatNumber === selectedSeat.seat
        );
        if (seatData?.id) {
          seatId = seatData.id;
        } else {
          console.error("Seat not found in allSeats:", { selectedSeat, allSeatsCount: allSeats.length });
          throw new Error("Seat information not available. Please try again.");
        }
      }

      // Send seat ID along with row and seat numbers
      const payload = {
        matchId: id,
        seatId: seatId,
        seatRow: selectedSeat.row,
        seatNumber: selectedSeat.seat,
        creditCardNumber: data.creditCardNumber,
        pinNumber: data.pinNumber,
      };

      console.log("Creating reservation with payload:", payload);

      const response = await apiRequest("POST", "/api/v1/Reservation", payload);
      
      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Reservation failed:", errorData);
        throw new Error(errorData || "Failed to create reservation");
      }
      
      return response.json() as Promise<ReservationResult>;
    },
    onSuccess: (data) => {
      console.log("Reservation successful:", data);
      setTicketNumber(data.ticketNumber);
      setShowConfirmation(true);
      queryClient.invalidateQueries({ queryKey: ["/api/v1/Match"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/Match", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/Reservation"] });
      toast({
        title: "Reservation Successful!",
        description: `Your ticket number is ${data.ticketNumber}`,
      });
    },
    onError: (error: Error) => {
      console.error("Reservation error:", error);
      toast({
        title: "Reservation Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      form.reset();
    },
  });

  const onSubmit = (data: PaymentForm) => {
    reserveMutation.mutate(data);
  };

  if (!user || user.role !== "fan" || user.status !== "approved") {
    return (
      <div className="container px-4 py-8 mx-auto">
        <Card className="max-w-md mx-auto overflow-visible">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="font-semibold text-lg mb-2">Access Denied</h3>
            <p className="text-muted-foreground text-center mb-4">
              Only approved fan accounts can make reservations.
            </p>
            <Link href="/matches">
              <Button variant="outline">Back to Matches</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <Card className="max-w-md mx-auto overflow-visible">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="font-semibold text-lg mb-2">Match Not Found</h3>
            <Link href="/matches">
              <Button variant="outline">Back to Matches</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <Card className="max-w-lg mx-auto overflow-visible">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-2 text-center">
              Reservation Confirmed!
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              Your seat has been reserved successfully.
            </p>

            <div className="w-full bg-muted rounded-lg p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-1">Match</p>
                <p className="font-semibold">
                  {match.homeTeam} vs {match.awayTeam}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(match.dateTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2 text-center">Ticket Number</p>
                <div className="flex justify-center">
                  <Badge variant="default" className="text-sm py-1 px-3">
                    <Ticket className="h-3 w-3 mr-1" />
                    {ticketNumber}
                  </Badge>
                </div>
              </div>

              {selectedSeat && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground mb-2 text-center">Reserved Seat</p>
                  <div className="flex justify-center">
                    <Badge variant="outline">
                      Row {selectedSeat.row + 1}, Seat {selectedSeat.seat + 1}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full" data-testid="button-view-reservations">
                  View My Reservations
                </Button>
              </Link>
              <Link href="/matches" className="flex-1">
                <Button variant="outline" className="w-full" data-testid="button-browse-more">
                  Browse More Matches
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <Link href={`/matches/${id}`}>
        <Button variant="ghost" className="mb-6" data-testid="button-back">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Match Details
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold mb-2">
          Reserve Seat
        </h1>
        <p className="text-muted-foreground">
          {match.homeTeam} vs {match.awayTeam} - {format(new Date(match.dateTime), "MMMM d, yyyy")}
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Seat Map - Takes 3 columns */}
        <div className="lg:col-span-3">
          <SeatMap
            rows={match.stadium.numberOfRows}
            seatsPerRow={match.stadium.seatsPerRow}
            reservedSeats={reservedSeats}
            selectedSeats={selectedSeat ? [selectedSeat] : []}
            onSeatSelect={(seats) => {
              // Only allow single seat selection
              if (seats.length > 0) {
                const seat = seats[seats.length - 1];
                // Find the seat ID from allSeats
                const seatData = allSeats.find(
                  s => s.rowNumber === seat.row && s.seatNumber === seat.seat
                );
                if (seatData?.id) {
                  setSelectedSeat({ ...seat, id: seatData.id });
                } else {
                  // If ID not found yet, store without ID (will be found on submit)
                  setSelectedSeat({ ...seat, id: '' });
                }
              } else {
                setSelectedSeat(null);
              }
            }}
          />
        </div>

        {/* Payment Form & Summary - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Match Info Card */}
          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle className="text-lg">Match Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Match</p>
                <p className="font-semibold">{match.homeTeam} vs {match.awayTeam}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">
                  {format(new Date(match.dateTime), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Venue</p>
                <p className="font-medium">{match.stadium.name}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Selected Seat
                </p>
                {selectedSeat ? (
                  <Badge variant="secondary">
                    Row {selectedSeat.row + 1}, Seat {selectedSeat.seat + 1}
                  </Badge>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No seat selected yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Form Card */}
          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Enter your credit card information to complete the reservation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="creditCardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Card Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1234567890123456"
                            maxLength={16}
                            data-testid="input-card-number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pinNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PIN</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="****"
                            maxLength={6}
                            data-testid="input-card-pin"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!selectedSeat || reserveMutation.isPending}
                    data-testid="button-confirm-reservation"
                  >
                    {reserveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Confirm Reservation"
                    )}
                  </Button>

                  {/* Show why button is disabled */}
                  {!selectedSeat && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please select a seat from the map
                    </p>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
