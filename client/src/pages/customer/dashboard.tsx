import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Ticket, Calendar, MapPin, Clock, Trash2, Loader2, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Reservation, MatchWithStadium } from "@shared/schema";
import { format, differenceInDays } from "date-fns";

interface ReservationWithMatch extends Reservation {
  match: MatchWithStadium;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: reservations, isLoading } = useQuery<ReservationWithMatch[]>({
    queryKey: ["/api/v1/Reservation"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/v1/Reservation");
      const result = await response.json();
      console.log("Reservations API response:", result);
      // Extract from response structure {success, statusCode, message, data: {items: [...]}}
      const items = result?.data?.items || [];
      console.log("Extracted reservations:", items);
      
      // Map API properties to expected format
      return items.map((item: any) => ({
        ...item,
        // Map match properties
        match: item.match ? {
          ...item.match,
          dateTime: item.match.scheduledDateTime,
          homeTeam: item.match.homeTeam?.name || '',
          awayTeam: item.match.awayTeam?.name || '',
        } : null,
        // Map seat properties to top level
        seatRow: item.seat?.rowNumber ?? 0,
        seatNumber: item.seat?.seatNumber ?? 0,
        ticketNumber: item.id, // Use reservation ID as ticket number
      }));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (reservationId: string) => {
      const response = await apiRequest("DELETE", `/api/v1/Reservation/${reservationId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/Reservation"] });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/Match"] });
      toast({ title: "Reservation cancelled successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel reservation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Ensure reservations is an array before using reduce
  const groupedReservations = Array.isArray(reservations) ? reservations.reduce((acc, res) => {
    // Skip reservations without match data
    if (!res.match || !res.match.id) {
      console.warn("Reservation missing match data:", res);
      return acc;
    }
    
    const matchId = res.match.id;
    if (!acc[matchId]) {
      acc[matchId] = {
        match: res.match,
        reservations: [],
      };
    }
    acc[matchId].reservations.push(res);
    return acc;
  }, {} as Record<string, { match: MatchWithStadium; reservations: ReservationWithMatch[] }>) : {};

  const matchGroups = groupedReservations ? Object.values(groupedReservations) : [];
  const upcomingGroups = matchGroups.filter(g => g.match?.dateTime && new Date(g.match.dateTime) > new Date());
  const pastGroups = matchGroups.filter(g => g.match?.dateTime && new Date(g.match.dateTime) <= new Date());

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2" data-testid="text-page-title">
          My Reservations
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName}! Here are your match reservations.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total">
              {isLoading ? "-" : reservations?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Matches</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary" data-testid="stat-upcoming">
              {isLoading ? "-" : upcomingGroups.length}
            </div>
            <p className="text-xs text-muted-foreground">Matches to attend</p>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Past Matches</CardTitle>
            <Trophy className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4" data-testid="stat-past">
              {isLoading ? "-" : pastGroups.length}
            </div>
            <p className="text-xs text-muted-foreground">Matches attended</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : matchGroups.length > 0 ? (
        <div className="space-y-8">
          {upcomingGroups.length > 0 && (
            <div>
              <h2 className="font-heading text-xl font-semibold mb-4">Upcoming Matches</h2>
              <div className="grid gap-4">
                {upcomingGroups.map(({ match, reservations: matchReservations }) => {
                  const daysUntil = differenceInDays(new Date(match.dateTime), new Date());
                  const canCancel = daysUntil >= 3;

                  return (
                    <Card key={match.id} className="overflow-visible" data-testid={`card-reservation-${match.id}`}>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg">
                              {match.homeTeam} vs {match.awayTeam}
                            </CardTitle>
                            <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(match.dateTime), "EEEE, MMMM d, yyyy")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(match.dateTime), "h:mm a")}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {match.stadium.name}
                              </span>
                            </CardDescription>
                          </div>
                          <Badge variant={daysUntil <= 7 ? "default" : "secondary"}>
                            {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {matchReservations.map((res) => (
                            <Link key={res.id} href={`/reservation/${res.id}`}>
                              <div
                                className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                                data-testid={`reservation-${res.id}`}
                              >
                                <div className="flex items-center gap-4 flex-wrap">
                                  <Badge variant="outline">
                                    Row {res.seatRow + 1}, Seat {res.seatNumber + 1}
                                  </Badge>
                                  <div className="flex items-center gap-2">
                                    <Ticket className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-mono">{res.ticketNumber}</span>
                                  </div>
                                </div>
                                {canCancel ? (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild onClick={(e) => e.preventDefault()}>
                                      <Button size="sm" variant="ghost" data-testid={`button-cancel-${res.id}`}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to cancel this reservation? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => cancelMutation.mutate(res.id)}
                                          className="bg-destructive text-destructive-foreground"
                                        >
                                          Cancel Reservation
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    Cannot cancel
                                  </Badge>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                        {!canCancel && (
                          <p className="text-xs text-muted-foreground mt-3">
                            Reservations cannot be cancelled within 3 days of the match.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {pastGroups.length > 0 && (
            <div>
              <h2 className="font-heading text-xl font-semibold mb-4 text-muted-foreground">Past Matches</h2>
              <div className="grid gap-4 opacity-75">
                {pastGroups.map(({ match, reservations: matchReservations }) => (
                  <Card key={match.id} className="overflow-visible">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-base">
                            {match.homeTeam} vs {match.awayTeam}
                          </CardTitle>
                          <CardDescription>
                            {format(new Date(match.dateTime), "MMMM d, yyyy")} at {match.stadium.name}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        {matchReservations.map((res) => (
                          <Badge key={res.id} variant="secondary">
                            R{res.seatRow + 1}-S{res.seatNumber + 1}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="overflow-visible">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Ticket className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Reservations Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't made any reservations. Browse upcoming matches to get started!
            </p>
            <Link href="/matches">
              <Button data-testid="button-browse-matches">
                Browse Matches
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
