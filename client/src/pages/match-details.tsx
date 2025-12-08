import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, User, Users, ArrowLeft, Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeatMap } from "@/components/seat-map";
import { useAuth } from "@/lib/auth";
import type { MatchWithStadium } from "@shared/schema";
import { format } from "date-fns";
import { matchApi } from "@/lib/api";
import { adaptMatch, type ApiMatch } from "@/lib/match-adapter";

export default function MatchDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: match, isLoading } = useQuery<MatchWithStadium | null>({
    queryKey: ["/api/v1/Match", id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) return null;
      const response = await matchApi.getById(id) as ApiMatch;
      return adaptMatch(response);
    },
  });

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
        <Card className="overflow-visible">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="font-semibold text-lg mb-2">Match Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The match you're looking for doesn't exist.
            </p>
            <Link href="/matches">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Matches
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const matchDate = new Date(match.dateTime);
  const isUpcoming = matchDate > new Date();
  const totalSeats = match.stadium.rows * match.stadium.seatsPerRow;
  const availableSeats = totalSeats - match.reservedSeats.length;

  return (
    <div className="container px-4 py-8 mx-auto">
      <Link href="/matches">
        <Button variant="ghost" className="mb-6" data-testid="button-back">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Matches
        </Button>
      </Link>

      <div className="bg-gradient-to-br from-primary/10 via-background to-background rounded-lg p-6 md:p-10 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 flex items-center justify-center gap-6 md:gap-12">
            <div className="text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-3">
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  {match.homeTeam.charAt(0)}
                </span>
              </div>
              <h2 className="font-heading font-bold text-lg md:text-xl" data-testid="text-home-team">
                {match.homeTeam}
              </h2>
              <p className="text-sm text-muted-foreground">Home</p>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-heading font-bold text-muted-foreground">
                VS
              </span>
              <Badge variant={isUpcoming ? "default" : "secondary"} className="mt-2">
                {isUpcoming ? "Upcoming" : "Completed"}
              </Badge>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-secondary flex items-center justify-center mb-3">
                <span className="text-3xl md:text-4xl font-bold text-secondary-foreground">
                  {match.awayTeam.charAt(0)}
                </span>
              </div>
              <h2 className="font-heading font-bold text-lg md:text-xl" data-testid="text-away-team">
                {match.awayTeam}
              </h2>
              <p className="text-sm text-muted-foreground">Away</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="overflow-visible">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold" data-testid="text-match-date">
              {format(matchDate, "EEEE, MMMM d, yyyy")}
            </p>
            <p className="text-muted-foreground" data-testid="text-match-time">
              {format(matchDate, "h:mm a")}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Venue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold" data-testid="text-venue">
              {match.stadium.name}
            </p>
            <p className="text-muted-foreground">
              VIP Lounge: {match.stadium.rows} rows, {match.stadium.seatsPerRow} seats/row
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold" data-testid="text-availability">
              {availableSeats} seats available
            </p>
            <p className="text-muted-foreground">
              {match.reservedSeats.length} of {totalSeats} reserved
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 overflow-visible">
        <CardHeader>
          <CardTitle className="text-lg font-heading">Match Officials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Main Referee</p>
                <p className="font-medium" data-testid="text-main-referee">{match.mainReferee}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">First Linesman</p>
                <p className="font-medium" data-testid="text-linesman1">{match.linesman1}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Second Linesman</p>
                <p className="font-medium" data-testid="text-linesman2">{match.linesman2}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SeatMap
        rows={match.stadium.rows}
        seatsPerRow={match.stadium.seatsPerRow}
        reservedSeats={match.reservedSeats}
        selectedSeats={[]}
        onSeatSelect={() => {}}
        readOnly
      />

      {isUpcoming && availableSeats > 0 && (
        <div className="mt-8 flex justify-center">
          {user && user.role === "fan" && user.status === "approved" ? (
            <Link href={`/matches/${match.id}/reserve`}>
              <Button size="lg" className="gap-2" data-testid="button-reserve-seats">
                <Ticket className="h-5 w-5" />
                Reserve Seats
              </Button>
            </Link>
          ) : !user ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                You need to be logged in to reserve seats.
              </p>
              <Link href="/login">
                <Button size="lg" data-testid="button-login-to-reserve">
                  Login to Reserve
                </Button>
              </Link>
            </div>
          ) : user.status !== "approved" ? (
            <p className="text-muted-foreground text-center">
              Your account needs to be approved before you can reserve seats.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
