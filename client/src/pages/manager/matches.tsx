import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Eye, Trash2, Loader2, Calendar, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MatchWithStadium } from "@shared/schema";
import { EGYPTIAN_TEAMS } from "@shared/schema";
import { format } from "date-fns";
import { matchApi } from "@/lib/api";
import { adaptMatchList, type MatchListResponse } from "@/lib/match-adapter";

export default function ManagerMatches() {
  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: matches, isLoading } = useQuery<MatchWithStadium[]>({
    queryKey: ["/api/v1/Match"],
    queryFn: async () => {
      const response = await matchApi.getAll() as any;
      console.log("Matches API Response (matches page):", response);
      console.log("Matches data:", response?.data);
      console.log("Matches data.items:", response?.data?.items);
      // API returns { success, statusCode, message, data: { items, pageIndex, ... } }
      const matchData = response?.data || {};
      const adapted = adaptMatchList(matchData);
      console.log("Matches adapted:", adapted, "length:", adapted.length);
      return adapted;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (matchId: string) => {
      console.log("Deleting match:", matchId);
      const response = await apiRequest("DELETE", `/api/v1/Match/${matchId}`);
      if (response.status === 204 || response.status === 200) {
        console.log("Match deleted successfully");
        return { success: true };
      }
      return response.json();
    },
    onSuccess: () => {
      console.log("Invalidating match queries");
      // Invalidate all match-related queries
      queryClient.invalidateQueries({ queryKey: ["/api/v1/Match"] });
      queryClient.refetchQueries({ queryKey: ["/api/v1/Match"] });
      toast({ title: "Match deleted successfully" });
    },
    onError: (error: Error) => {
      console.error("Delete match error:", error);
      toast({ title: "Failed to delete match", description: error.message, variant: "destructive" });
    },
  });

  const filteredMatches = matches?.filter((match) => {
    const matchesSearch =
      (match.homeTeam || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (match.awayTeam || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.stadium.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTeam =
      teamFilter === "all" ||
      match.homeTeam === teamFilter ||
      match.awayTeam === teamFilter;

    return matchesSearch && matchesTeam;
  });

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2" data-testid="text-page-title">
            Match Management
          </h1>
          <p className="text-muted-foreground">
            Create, edit, and manage match events
          </p>
        </div>
        <Link href="/manager/matches/new">
          <Button data-testid="button-create-match">
            <Plus className="mr-2 h-4 w-4" />
            Create Match
          </Button>
        </Link>
      </div>

      <Card className="overflow-visible">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search matches..."
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredMatches && filteredMatches.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatches.map((match) => {
                    const isUpcoming = new Date(match.dateTime) > new Date();
                    const totalSeats = match.stadium.numberOfRows * match.stadium.seatsPerRow;
                    const available = totalSeats - match.reservedSeats.length;

                    return (
                      <TableRow key={match.id} data-testid={`row-match-${match.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {match.homeTeam} vs {match.awayTeam}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Referee: {match.mainReferee}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {format(new Date(match.dateTime), "MMM d, yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(match.dateTime), "h:mm a")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {match.stadium.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={isUpcoming ? "default" : "secondary"}>
                            {isUpcoming ? "Upcoming" : "Completed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {available}/{totalSeats}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/matches/${match.id}`}>
                              <Button size="sm" variant="ghost" data-testid={`button-view-${match.id}`}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/manager/matches/${match.id}/edit`}>
                              <Button size="sm" variant="ghost" data-testid={`button-edit-${match.id}`}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="ghost" data-testid={`button-delete-${match.id}`}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Match</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this match? This will also cancel all reservations.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(match.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Matches Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || teamFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Create your first match to get started."}
              </p>
              {!searchTerm && teamFilter === "all" && (
                <Link href="/manager/matches/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Match
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
