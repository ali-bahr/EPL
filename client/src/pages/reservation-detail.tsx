import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, MapPin, Clock, Ticket, User, CreditCard, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function ReservationDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: reservation, isLoading } = useQuery({
    queryKey: ["/api/v1/Reservation", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/v1/Reservation/${id}`);
      const result = await response.json();
      console.log("Reservation detail response:", result);
      
      // Extract data from {success, statusCode, message, data: {...}}
      const item = result?.data || result;
      
      // Map properties to expected format
      return {
        ...item,
        match: item.match ? {
          ...item.match,
          dateTime: item.match.scheduledDateTime,
          homeTeam: item.match.homeTeam?.name || '',
          awayTeam: item.match.awayTeam?.name || '',
        } : null,
        seatRow: item.seat?.rowNumber ?? 0,
        seatNumber: item.seat?.seatNumber ?? 0,
        ticketNumber: item.id,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <Card className="max-w-md mx-auto overflow-visible">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="font-semibold text-lg mb-2">Reservation Not Found</h3>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { match, seat, user } = reservation;

  return (
    <div className="container px-4 py-8 mx-auto max-w-3xl">
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Reservations
        </Button>
      </Link>

      <Card className="overflow-visible">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Ticket className="h-8 w-8 text-primary" />
            </div>
            <Badge variant="default" className="text-base py-2 px-4">
              Confirmed
            </Badge>
          </div>
          <CardTitle className="text-2xl">Ticket Information</CardTitle>
          <CardDescription className="text-base">
            Ticket Number: <span className="font-mono font-semibold">{reservation.ticketNumber}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Match Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Match Details
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Match</p>
                <p className="font-semibold text-lg">
                  {match.homeTeam} vs {match.awayTeam}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="font-medium">
                    {format(new Date(match.dateTime), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Time</p>
                  <p className="font-medium">
                    {format(new Date(match.dateTime), "h:mm a")}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Venue</p>
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {match.stadium.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Referee</p>
                  <p className="text-sm">{match.referee?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Linesmen</p>
                  <p className="text-sm">
                    {match.linesman1?.name}, {match.linesman2?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Seat Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Seat Information</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Row</p>
                  <Badge variant="default" className="text-2xl py-2 px-4">
                    {reservation.seatRow + 1}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Seat</p>
                  <Badge variant="default" className="text-2xl py-2 px-4">
                    {reservation.seatNumber + 1}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Customer Information
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{user.city}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{user.address}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Important Notes */}
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-900">
            <h4 className="font-semibold mb-2 text-amber-900 dark:text-amber-100">Important Information</h4>
            <ul className="text-sm space-y-1 text-amber-800 dark:text-amber-200">
              <li>• Please arrive at least 30 minutes before kickoff</li>
              <li>• Bring a valid ID for verification</li>
              <li>• This ticket is non-transferable</li>
              <li>• Save or print this ticket for entry</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => window.print()}>
              Print Ticket
            </Button>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
