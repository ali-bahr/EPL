import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar, Filter, Loader2, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MatchCard } from "@/components/match-card";
import type { MatchWithStadium } from "@shared/schema";
import { EGYPTIAN_TEAMS } from "@shared/schema";
import { matchApi } from "@/lib/api";
import { adaptMatchList, type MatchListResponse } from "@/lib/match-adapter";

export default function Matches() {
  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: matches, isLoading } = useQuery<MatchWithStadium[]>({
    queryKey: ["/api/v1/Match"],
    queryFn: async () => {
      const response = await matchApi.getAll() as MatchListResponse;
      console.log("Match: ", response);
      return adaptMatchList(response);
    },
  });

  const filteredMatches = matches?.filter((match) => {
    const matchesSearch =
      match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.stadium.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTeam =
      teamFilter === "all" ||
      match.homeTeam === teamFilter ||
      match.awayTeam === teamFilter;

    const isUpcoming = new Date(match.dateTime) > new Date();
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "upcoming" && isUpcoming) ||
      (statusFilter === "completed" && !isUpcoming);

    return matchesSearch && matchesTeam && matchesStatus;
  });

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2" data-testid="text-page-title">
          Match Schedule
        </h1>
        <p className="text-muted-foreground">
          Browse all Egyptian Premier League matches and reserve your seats
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by team or stadium..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-team-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {EGYPTIAN_TEAMS.map((team) => (
              <SelectItem key={team} value={team}>
                {team}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Match status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Matches</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredMatches && filteredMatches.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <Card className="overflow-visible">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Matches Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchTerm || teamFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search or filters to find matches."
                : "There are no matches scheduled yet. Check back later!"}
            </p>
            {(searchTerm || teamFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setTeamFilter("all");
                  setStatusFilter("all");
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
