import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Plus, ArrowRight, Loader2, Trophy, Users, Flag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MatchWithStadium, Stadium } from "@shared/schema";
import { format } from "date-fns";
import { matchApi } from "@/lib/api";
import { adaptMatchList, type MatchListResponse } from "@/lib/match-adapter";

export default function ManagerDashboard() {
  const { data: matches, isLoading: matchesLoading } = useQuery<MatchWithStadium[]>({
    queryKey: ["/api/v1/Match"],
    queryFn: async () => {
      const response = await matchApi.getAll() as MatchListResponse;
      return adaptMatchList(response);
    },
  });

  const { data: stadiums, isLoading: stadiumsLoading } = useQuery<Stadium[]>({
    queryKey: ["/api/v1/Stadium"],
  });

  const upcomingMatches = matches?.filter((m) => new Date(m.dateTime) > new Date()) || [];
  const totalReservations = matches?.reduce((acc, m) => acc + m.reservedSeats.length, 0) || 0;

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2" data-testid="text-page-title">
          Manager Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage matches, stadiums, and view reservation statistics
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-matches">
              {matchesLoading ? "-" : matches?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">All scheduled matches</p>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary" data-testid="stat-upcoming-matches">
              {matchesLoading ? "-" : upcomingMatches.length}
            </div>
            <p className="text-xs text-muted-foreground">Future matches</p>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Stadiums</CardTitle>
            <MapPin className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4" data-testid="stat-stadiums">
              {stadiumsLoading ? "-" : stadiums?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Available venues</p>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Reservations</CardTitle>
            <Trophy className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2" data-testid="stat-reservations">
              {matchesLoading ? "-" : totalReservations}
            </div>
            <p className="text-xs text-muted-foreground">Total seats reserved</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Create and manage content</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/manager/matches/new">
              <Button className="w-full justify-start" data-testid="link-create-match">
                <Plus className="mr-2 h-4 w-4" />
                Create New Match
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <Link href="/manager/stadiums/new">
              <Button variant="outline" className="w-full justify-start" data-testid="link-add-stadium">
                <Plus className="mr-2 h-4 w-4" />
                Add New Stadium
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <Link href="/manager/matches">
              <Button variant="outline" className="w-full justify-start" data-testid="link-manage-matches">
                <Calendar className="mr-2 h-4 w-4" />
                Manage All Matches
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <Link href="/manager/stadiums">
              <Button variant="outline" className="w-full justify-start" data-testid="link-manage-stadiums">
                <MapPin className="mr-2 h-4 w-4" />
                Manage Stadiums
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <Link href="/manager/referees">
              <Button variant="outline" className="w-full justify-start" data-testid="link-manage-referees">
                <Users className="mr-2 h-4 w-4" />
                Manage Referees
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <Link href="/manager/linesmen">
              <Button variant="outline" className="w-full justify-start" data-testid="link-manage-linesmen">
                <Flag className="mr-2 h-4 w-4" />
                Manage Linesmen
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Upcoming Matches</CardTitle>
              <CardDescription>Next scheduled events</CardDescription>
            </div>
            <Link href="/manager/matches">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {matchesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : upcomingMatches.length > 0 ? (
              <div className="space-y-3">
                {upcomingMatches.slice(0, 4).map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50"
                    data-testid={`upcoming-match-${match.id}`}
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {match.homeTeam} vs {match.awayTeam}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(match.dateTime), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {match.stadium.rows * match.stadium.seatsPerRow - match.reservedSeats.length} seats
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No upcoming matches</p>
                <Link href="/manager/matches/new">
                  <Button variant="ghost" className="mt-2">
                    Create your first match
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
