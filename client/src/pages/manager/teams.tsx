import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Shield, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { teamApi, stadiumApi } from "@/lib/api";
import type { Team, InsertTeam, Stadium } from "@shared/schema";
import { insertTeamSchema } from "@shared/schema";

export default function ManagerTeams() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: response, isLoading } = useQuery<any>({
    queryKey: ["/api/v1/Team"],
    queryFn: async () => {
      const res = await teamApi.getAll();
      console.log("Teams API Response:", res);
      console.log("Teams data.items:", res?.data?.items);
      return res;
    },
  });

  const { data: stadiumsResponse, isLoading: stadiumsLoading } = useQuery<any>({
    queryKey: ["/api/v1/Stadium"],
    queryFn: async () => {
      const res = await stadiumApi.getAll();
      console.log("Stadiums API Response (teams page):", res);
      console.log("Stadiums data.items:", res?.data?.items);
      return res;
    },
  });

  const teams = response?.data?.items || [];
  const stadiums = stadiumsResponse?.data?.items || [];

  console.log("Teams extracted:", teams, "length:", teams.length);
  console.log("Stadiums extracted:", stadiums, "length:", stadiums.length);

  const form = useForm<InsertTeam>({
    resolver: zodResolver(insertTeamSchema),
    defaultValues: {
      name: "",
      logo: "",
      stadiumId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTeam) => {
      return await teamApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/Team"] });
      toast({ title: "Team added successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (teamId: string) => {
      // Note: Backend may not support DELETE yet, returning 405
      return await teamApi.delete(teamId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/Team"] });
      queryClient.refetchQueries({ queryKey: ["/api/v1/Team"] });
      toast({ title: "Team deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete team",
        description: error.message === "Method Not Allowed" 
          ? "Team deletion is not supported by the backend yet" 
          : error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTeam) => {
    createMutation.mutate(data);
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">
            Team Management
          </h1>
          <p className="text-muted-foreground">
            Manage teams and their home stadiums
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team</DialogTitle>
              <DialogDescription>
                Add a new team to the system
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter team name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com/logo.png" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stadiumId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Stadium *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stadium" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stadiumsLoading ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading stadiums...</div>
                          ) : stadiums && stadiums.length > 0 ? (
                            stadiums.map((stadium: Stadium) => (
                              <SelectItem key={stadium.id} value={stadium.id}>
                                {stadium.name}
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
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Team"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : teams && teams.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team: Team) => (
            <Card key={team.id} className="overflow-visible">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1">
                    {team.logo ? (
                      <img 
                        src={team.logo} 
                        alt={team.name}
                        className="h-12 w-12 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Shield className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg font-heading">
                        {team.name}
                      </CardTitle>
                      {team.stadium && (
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {team.stadium.name}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Team</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{team.name}"? This action cannot be undone if no matches are assigned to this team.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(team.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              {team.stadium && (
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-fit">
                      <MapPin className="h-3 w-3 mr-1" />
                      {team.stadium.numberOfRows * team.stadium.seatsPerRow} capacity
                    </Badge>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-visible">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Teams</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't added any teams yet. Add your first team to get started.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
