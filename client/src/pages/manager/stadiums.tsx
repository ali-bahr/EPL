import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, MapPin, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Stadium } from "@shared/schema";

export default function ManagerStadiums() {
  const { toast } = useToast();

  const { data: stadiums, isLoading } = useQuery<Stadium[]>({
    queryKey: ["/api/stadiums"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (stadiumId: string) => {
      const response = await apiRequest("DELETE", `/api/stadiums/${stadiumId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stadiums"] });
      toast({ title: "Stadium deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete stadium",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2" data-testid="text-page-title">
            Stadium Management
          </h1>
          <p className="text-muted-foreground">
            Manage stadiums and their VIP seating layouts
          </p>
        </div>
        <Link href="/manager/stadiums/new">
          <Button data-testid="button-create-stadium">
            <Plus className="mr-2 h-4 w-4" />
            Add Stadium
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : stadiums && stadiums.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stadiums.map((stadium) => (
            <Card key={stadium.id} className="overflow-visible" data-testid={`card-stadium-${stadium.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg font-heading">{stadium.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      VIP Lounge
                    </CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" data-testid={`button-delete-${stadium.id}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Stadium</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{stadium.name}"? This action cannot be undone if no matches are scheduled at this venue.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(stadium.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Grid className="h-4 w-4" />
                    {stadium.rows} rows x {stadium.seatsPerRow} seats
                  </div>
                </div>
                <Badge variant="secondary">
                  {stadium.rows * stadium.seatsPerRow} total seats
                </Badge>

                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground text-center mb-2">Seating Preview</p>
                  <div className="flex flex-col gap-0.5 items-center">
                    {Array.from({ length: Math.min(stadium.rows, 5) }, (_, i) => (
                      <div key={i} className="flex gap-0.5">
                        {Array.from({ length: Math.min(stadium.seatsPerRow, 10) }, (_, j) => (
                          <div key={j} className="w-2 h-2 rounded-sm bg-primary/30" />
                        ))}
                        {stadium.seatsPerRow > 10 && <span className="text-xs text-muted-foreground ml-1">...</span>}
                      </div>
                    ))}
                    {stadium.rows > 5 && <span className="text-xs text-muted-foreground">...</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-visible">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Stadiums Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first stadium to start scheduling matches.
            </p>
            <Link href="/manager/stadiums/new">
              <Button data-testid="button-add-first-stadium">
                <Plus className="mr-2 h-4 w-4" />
                Add Stadium
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
