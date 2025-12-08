import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, UserCheck, Globe } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { refereeApi } from "@/lib/api";
import type { Referee, InsertReferee } from "@shared/schema";

export default function ManagerReferees() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReferee, setNewReferee] = useState<InsertReferee>({
    name: "",
    isInternational: false,
  });

  const { data: response, isLoading } = useQuery<any>({
    queryKey: ["/api/v1/Referee"],
    queryFn: async () => {
      const res = await refereeApi.getAll();
      return res;
    },
  });

  const referees = response?.data?.items || response?.items || [];

  const createMutation = useMutation({
    mutationFn: async (data: InsertReferee) => {
      return await refereeApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/Referee"] });
      toast({ title: "Referee added successfully" });
      setIsDialogOpen(false);
      setNewReferee({ name: "", isInternational: false });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add referee",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (refereeId: string) => {
      return await refereeApi.delete(refereeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/Referee"] });
      toast({ title: "Referee deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete referee",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!newReferee.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Referee name is required",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(newReferee);
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">
            Referee Management
          </h1>
          <p className="text-muted-foreground">
            Manage referees for matches
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Referee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Referee</DialogTitle>
              <DialogDescription>
                Add a new referee to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Referee Name *</Label>
                <Input
                  id="name"
                  value={newReferee.name}
                  onChange={(e) => setNewReferee({ ...newReferee, name: e.target.value })}
                  placeholder="Enter referee name"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="international"
                  checked={newReferee.isInternational}
                  onCheckedChange={(checked) => 
                    setNewReferee({ ...newReferee, isInternational: checked as boolean })
                  }
                />
                <Label htmlFor="international" className="cursor-pointer">
                  International Referee
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Referee"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : referees && referees.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {referees.map((referee: Referee) => (
            <Card key={referee.id} className="overflow-visible">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-heading flex items-center gap-2">
                      {referee.name}
                      {referee.isInternational && (
                        <Globe className="h-4 w-4 text-primary" />
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <UserCheck className="h-3 w-3" />
                      Main Referee
                    </CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Referee</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{referee.name}"? This action cannot be undone if no matches are assigned to this referee.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(referee.id)}
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
                <div className="space-y-2">
                  {referee.isInternational && (
                    <Badge variant="default" className="w-fit">
                      <Globe className="h-3 w-3 mr-1" />
                      International
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-visible">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Referees</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't added any referees yet. Add your first referee to get started.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Referee
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
