import { Link } from "wouter";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MatchWithStadium } from "@shared/schema";
import { format } from "date-fns";

interface MatchCardProps {
  match: MatchWithStadium;
  showReserveButton?: boolean;
  onReserve?: () => void;
}

export function MatchCard({ match, showReserveButton = true, onReserve }: MatchCardProps) {
  const matchDate = new Date(match.dateTime);
  const totalSeats = match.stadium.rows * match.stadium.seatsPerRow;
  const availableSeats = totalSeats - match.reservedSeats.length;
  const isUpcoming = matchDate > new Date();

  return (
    <Card className="overflow-visible" data-testid={`card-match-${match.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Badge variant={isUpcoming ? "default" : "secondary"}>
            {isUpcoming ? "Upcoming" : "Completed"}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {availableSeats} seats
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <span className="text-xl font-bold text-primary">
                {match.homeTeam.charAt(0)}
              </span>
            </div>
            <p className="font-semibold text-sm" data-testid={`text-home-team-${match.id}`}>
              {match.homeTeam}
            </p>
            <p className="text-xs text-muted-foreground">Home</p>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-heading font-bold text-muted-foreground">VS</span>
          </div>
          
          <div className="flex-1 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-secondary flex items-center justify-center mb-2">
              <span className="text-xl font-bold text-secondary-foreground">
                {match.awayTeam.charAt(0)}
              </span>
            </div>
            <p className="font-semibold text-sm" data-testid={`text-away-team-${match.id}`}>
              {match.awayTeam}
            </p>
            <p className="text-xs text-muted-foreground">Away</p>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span data-testid={`text-match-date-${match.id}`}>
              {format(matchDate, "EEEE, MMMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 shrink-0" />
            <span data-testid={`text-match-time-${match.id}`}>
              {format(matchDate, "h:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span data-testid={`text-match-venue-${match.id}`}>
              {match.stadium.name}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Link href={`/matches/${match.id}`} className="flex-1">
          <Button variant="outline" className="w-full" data-testid={`button-view-match-${match.id}`}>
            View Details
          </Button>
        </Link>
        {showReserveButton && isUpcoming && availableSeats > 0 && (
          <Link href={`/matches/${match.id}/reserve`} className="flex-1">
            <Button className="w-full" onClick={onReserve} data-testid={`button-reserve-${match.id}`}>
              Reserve Seats
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
