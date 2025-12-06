import { useState } from "react";
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
import type { MatchWithStadium } from "@shared/schema";
import { format } from "date-fns";

const paymentSchema = z.object({
  creditCardNumber: z.string().length(16, "Card number must be 16 digits").regex(/^\d+$/, "Only digits allowed"),
  creditCardPin: z.string().min(4, "PIN must be at least 4 digits").regex(/^\d+$/, "Only digits allowed"),
});

type PaymentForm = z.infer<typeof paymentSchema>;

interface ReservationResult {
  reservations: Array<{
    id: string;
    ticketNumber: string;
    seatRow: number;
    seatNumber: number;
  }>;
}

export default function MatchReserve() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSeats, setSelectedSeats] = useState<Array<{ row: number; seat: number }>>([]);
  const [step, setStep] = useState<"seats" | "payment" | "confirmation">("seats");
  const [ticketNumbers, setTicketNumbers] = useState<string[]>([]);

  const { data: match, isLoading } = useQuery<MatchWithStadium>({
    queryKey: ["/api/matches", id],
  });

  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      creditCardNumber: "",
      creditCardPin: "",
    },
  });

  const reserveMutation = useMutation({
    mutationFn: async (data: PaymentForm) => {
      const response = await apiRequest("POST", "/api/reservations", {
        matchId: id,
        seats: selectedSeats,
        ...data,
      });
      return response.json() as Promise<ReservationResult>;
    },
    onSuccess: (data) => {
      setTicketNumbers(data.reservations.map((r) => r.ticketNumber));
      setStep("confirmation");
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/matches", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Reservation Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
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

  if (step === "confirmation") {
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
              Your seats have been reserved successfully.
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
                <p className="text-sm text-muted-foreground mb-2 text-center">Ticket Numbers</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {ticketNumbers.map((ticket, index) => (
                    <Badge key={ticket} variant="default" className="text-sm py-1 px-3">
                      <Ticket className="h-3 w-3 mr-1" />
                      {ticket}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-muted-foreground mb-2 text-center">Reserved Seats</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedSeats.map((seat) => (
                    <Badge key={`${seat.row}-${seat.seat}`} variant="outline">
                      Row {seat.row + 1}, Seat {seat.seat + 1}
                    </Badge>
                  ))}
                </div>
              </div>
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
          Reserve Seats
        </h1>
        <p className="text-muted-foreground">
          {match.homeTeam} vs {match.awayTeam} - {format(new Date(match.dateTime), "MMMM d, yyyy")}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {step === "seats" && (
            <>
              <SeatMap
                rows={match.stadium.rows}
                seatsPerRow={match.stadium.seatsPerRow}
                reservedSeats={match.reservedSeats}
                selectedSeats={selectedSeats}
                onSeatSelect={setSelectedSeats}
              />

              <div className="mt-6 flex justify-end">
                <Button
                  size="lg"
                  disabled={selectedSeats.length === 0}
                  onClick={() => setStep("payment")}
                  data-testid="button-continue-payment"
                >
                  Continue to Payment
                </Button>
              </div>
            </>
          )}

          {step === "payment" && (
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
                      name="creditCardPin"
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

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep("seats")}
                        data-testid="button-back-to-seats"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={reserveMutation.isPending}
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
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-24 overflow-visible">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
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
                  Selected Seats ({selectedSeats.length})
                </p>
                {selectedSeats.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map((seat) => (
                      <Badge key={`${seat.row}-${seat.seat}`} variant="secondary">
                        R{seat.row + 1}-S{seat.seat + 1}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No seats selected yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
