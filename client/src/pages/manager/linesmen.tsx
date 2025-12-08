import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Flag, Globe } from "lucide-react";
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
import { linesmanApi } from "@/lib/api";
import type { Linesman, InsertLinesman } from "@shared/schema";

export default function ManagerLinesmen() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLinesman, setNewLinesman] = useState<InsertLinesman>({
    name: "",
    isInternational: false,
  });

  const { data: response, isLoading } = useQuery<any>({
    queryKey: ["/api/v1/Linesman"],
    queryFn: async () => {
      const res = await linesmanApi.getAll();
      return res;
    },
  });

  const linesmen = response?.data?.items || response?.items || [];

  const createMutation = useMutation({
    mutationFn: async (data: InsertLinesman) => {
      return await linesmanApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/Linesman"] });
      toast({ title: "Linesman added successfully" });
      setIsDialogOpen(false);
      setNewLinesman({ name: "", isInternational: false });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add linesman",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (linesmanId: string) => {
      return await linesmanApi.delete(linesmanId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/Linesman"] });
      toast({ title: "Linesman deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete linesman",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!newLinesman.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Linesman name is required",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(newLinesman);
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">
            Linesman Management
          </h1>
          <p className="text-muted-foreground">
            Manage linesmen for matches
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Linesman
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Linesman</DialogTitle>
              <DialogDescription>
                Add a new linesman to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Linesman Name *</Label>
                <Input
                  id="name"
                  value={newLinesman.name}
                  onChange={(e) => setNewLinesman({ ...newLinesman, name: e.target.value })}
                  placeholder="Enter linesman name"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="international"
                  checked={newLinesman.isInternational}
                  onCheckedChange={(checked) => 
                    setNewLinesman({ ...newLinesman, isInternational: checked as boolean })
                  }
                />
                <Label htmlFor="international" className="cursor-pointer">
                  International Linesman
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
                  "Add Linesman"
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
      ) : linesmen && linesmen.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {linesmen.map((linesman: Linesman) => (
            <Card key={linesman.id} className="overflow-visible">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-heading flex items-center gap-2">
                      {linesman.name}
                      {linesman.isInternational && (
                        <Globe className="h-4 w-4 text-primary" />
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Flag className="h-3 w-3" />
                      Assistant Referee
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
                        <AlertDialogTitle>Delete Linesman</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{linesman.name}"? This action cannot be undone if no matches are assigned to this linesman.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(linesman.id)}
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
                  {linesman.isInternational && (
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
            <Flag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Linesmen</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't added any linesmen yet. Add your first linesman to get started.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Linesman
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
