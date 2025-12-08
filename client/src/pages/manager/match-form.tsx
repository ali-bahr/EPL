import { useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertMatchSchema, EGYPTIAN_TEAMS, type InsertMatch, type Match, type Stadium, type Referee, type Linesman } from "@shared/schema";
import { matchApi, teamApi, refereeApi, linesmanApi, stadiumApi } from "@/lib/api";
import { adaptMatch, mapToCreateMatchRequest, type ApiMatch } from "@/lib/match-adapter";

export default function MatchForm() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const { data: match, isLoading: matchLoading } = useQuery<Match>({
    queryKey: ["/api/matches", id],
    enabled: isEditing,
  });

  const { data: stadiums, isLoading: stadiumsLoading } = useQuery<Stadium[]>({
    queryKey: ["/api/v1/Stadium"],
    queryFn: async () => {
      const response = await stadiumApi.getAll() as any;
      // Backend returns: {success, statusCode, message, data: {items, pageIndex, ...}}
      if (response?.data?.items) {
        return response.data.items;
      }
      return [];
    },
  });

  const { data: teams, isLoading: teamsLoading } = useQuery<any[]>({
    queryKey: ["/api/v1/Team"],
    queryFn: async () => {
      const response = await teamApi.getAll() as any;
      // Backend returns: {success, statusCode, message, data: {items, pageIndex, ...}}
      if (response?.data?.items) {
        return response.data.items;
      }
      return [];
    },
  });

  const { data: referees, isLoading: refereesLoading } = useQuery<Referee[]>({
    queryKey: ["/api/v1/Referee"],
    queryFn: async () => {
      const response = await refereeApi.getAll() as any;
      // Backend returns: {success, statusCode, message, data: {items, pageIndex, ...}}
      if (response?.data?.items) {
        return response.data.items;
      }
      return [];
    },
  });

  const { data: linesmen, isLoading: linesmenLoading } = useQuery<Linesman[]>({
    queryKey: ["/api/v1/Linesman"],
    queryFn: async () => {
      const response = await linesmanApi.getAll() as any;
      // Backend returns: {success, statusCode, message, data: {items, pageIndex, ...}}
      if (response?.data?.items) {
        return response.data.items;
      }
      return [];
    },
  });

  const form = useForm<any>({
    resolver: zodResolver(insertMatchSchema),
    defaultValues: {
      homeTeamId: "",
      awayTeamId: "",
      stadiumId: "",
      dateTime: "",
      mainRefereeId: "",
      linesman1Id: "",
      linesman2Id: "",
    },
  });

  useEffect(() => {
    if (match) {
      const dateTime = new Date(match.dateTime);
      const localDateTime = new Date(dateTime.getTime() - dateTime.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      
      form.reset({
        homeTeamId: match.homeTeam,
        awayTeamId: match.awayTeam,
        stadiumId: match.stadiumId,
        dateTime: localDateTime,
        mainRefereeId: match.mainRefereeId,
        linesman1Id: match.linesman1Id,
        linesman2Id: match.linesman2Id,
      });
    }
  }, [match, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = mapToCreateMatchRequest(
        data.homeTeamId,
        data.awayTeamId,
        data.stadiumId,
        data.mainRefereeId,
        data.linesman1Id,
        data.linesman2Id,
        data.dateTime
      );
      
      if (isEditing) {
        const response = await matchApi.update(id, payload) as ApiMatch;
        return adaptMatch(response);
      } else {
        const response = await matchApi.create(payload) as ApiMatch;
        return adaptMatch(response);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/Match"] });
      toast({
        title: isEditing ? "Match Updated" : "Match Created",
        description: isEditing ? "The match has been updated successfully." : "The new match has been created.",
      });
      setLocation("/manager/matches");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertMatch) => {
    saveMutation.mutate(data);
  };

  if (isEditing && matchLoading) {
    return (
      <div className="container px-4 py-8 mx-auto flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <Link href="/manager/matches">
        <Button variant="ghost" className="mb-6" data-testid="button-back">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Matches
        </Button>
      </Link>

      <Card className="max-w-2xl mx-auto overflow-visible">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            {isEditing ? "Edit Match" : "Create New Match"}
          </CardTitle>
          <CardDescription>
            {isEditing ? "Update match details" : "Schedule a new Egyptian Premier League match"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="homeTeamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Team *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-home-team">
                            <SelectValue placeholder="Select home team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teamsLoading ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading teams...</div>
                          ) : teams && teams.length > 0 ? (
                            teams.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">No teams available</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="awayTeamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Away Team *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-away-team">
                            <SelectValue placeholder="Select away team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teamsLoading ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading teams...</div>
                          ) : teams && teams.length > 0 ? (
                            teams.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">No teams available</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="stadiumId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-stadium">
                          <SelectValue placeholder="Select stadium" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stadiumsLoading ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading stadiums...</div>
                        ) : stadiums && stadiums.length > 0 ? (
                          stadiums.map((stadium) => (
                            <SelectItem key={stadium.id} value={stadium.id}>
                              {stadium.name} ({stadium.rows * stadium.seatsPerRow} seats)
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">No stadiums available</div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        data-testid="input-datetime"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="font-medium text-sm">Match Officials</h3>
                
                <FormField
                  control={form.control}
                  name="mainRefereeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Referee *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-main-referee">
                            <SelectValue placeholder="Select referee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {refereesLoading ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading referees...</div>
                          ) : referees && referees.length > 0 ? (
                            referees.map((ref) => (
                              <SelectItem key={ref.id} value={ref.id}>
                                {ref.name} {ref.isInternational && "🌐"}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">No referees available</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="linesman1Id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Linesman *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-linesman1">
                              <SelectValue placeholder="Select linesman" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {linesmenLoading ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading linesmen...</div>
                            ) : linesmen && linesmen.length > 0 ? (
                              linesmen.map((linesman) => (
                                <SelectItem key={linesman.id} value={linesman.id}>
                                  {linesman.name} {linesman.isInternational && "🌐"}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">No linesmen available</div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linesman2Id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Second Linesman *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-linesman2">
                              <SelectValue placeholder="Select linesman" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {linesmenLoading ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading linesmen...</div>
                            ) : linesmen && linesmen.length > 0 ? (
                              linesmen.map((linesman) => (
                                <SelectItem key={linesman.id} value={linesman.id}>
                                  {linesman.name} {linesman.isInternational && "🌐"}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">No linesmen available</div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Link href="/manager/matches">
                  <Button type="button" variant="outline" data-testid="button-cancel">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  data-testid="button-save"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? "Update Match" : "Create Match"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
