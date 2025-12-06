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
import { insertMatchSchema, EGYPTIAN_TEAMS, type InsertMatch, type Match, type Stadium } from "@shared/schema";

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
    queryKey: ["/api/stadiums"],
  });

  const form = useForm<InsertMatch>({
    resolver: zodResolver(insertMatchSchema),
    defaultValues: {
      homeTeam: "Al Ahly",
      awayTeam: "Zamalek",
      stadiumId: "",
      dateTime: "",
      mainReferee: "",
      linesman1: "",
      linesman2: "",
    },
  });

  useEffect(() => {
    if (match) {
      const dateTime = new Date(match.dateTime);
      const localDateTime = new Date(dateTime.getTime() - dateTime.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      
      form.reset({
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        stadiumId: match.stadiumId,
        dateTime: localDateTime,
        mainReferee: match.mainReferee,
        linesman1: match.linesman1,
        linesman2: match.linesman2,
      });
    }
  }, [match, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: InsertMatch) => {
      const payload = {
        ...data,
        dateTime: new Date(data.dateTime).toISOString(),
      };
      
      if (isEditing) {
        const response = await apiRequest("PATCH", `/api/matches/${id}`, payload);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/matches", payload);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
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
                  name="homeTeam"
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
                          {EGYPTIAN_TEAMS.map((team) => (
                            <SelectItem key={team} value={team}>
                              {team}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="awayTeam"
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
                          {EGYPTIAN_TEAMS.map((team) => (
                            <SelectItem key={team} value={team}>
                              {team}
                            </SelectItem>
                          ))}
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
                          <SelectItem value="" disabled>Loading stadiums...</SelectItem>
                        ) : stadiums && stadiums.length > 0 ? (
                          stadiums.map((stadium) => (
                            <SelectItem key={stadium.id} value={stadium.id}>
                              {stadium.name} ({stadium.rows * stadium.seatsPerRow} seats)
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>No stadiums available</SelectItem>
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
                  name="mainReferee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Referee *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter referee name"
                          data-testid="input-main-referee"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="linesman1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Linesman *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter linesman name"
                            data-testid="input-linesman1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linesman2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Second Linesman *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter linesman name"
                            data-testid="input-linesman2"
                            {...field}
                          />
                        </FormControl>
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
