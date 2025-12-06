import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save, Grid } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertStadiumSchema, type InsertStadium } from "@shared/schema";

export default function StadiumForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<InsertStadium>({
    resolver: zodResolver(insertStadiumSchema),
    defaultValues: {
      name: "",
      rows: 10,
      seatsPerRow: 20,
    },
  });

  const watchRows = form.watch("rows");
  const watchSeatsPerRow = form.watch("seatsPerRow");
  const totalSeats = (watchRows || 0) * (watchSeatsPerRow || 0);

  const saveMutation = useMutation({
    mutationFn: async (data: InsertStadium) => {
      const response = await apiRequest("POST", "/api/stadiums", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stadiums"] });
      toast({
        title: "Stadium Created",
        description: "The new stadium has been added successfully.",
      });
      setLocation("/manager/stadiums");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertStadium) => {
    saveMutation.mutate(data);
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <Link href="/manager/stadiums">
        <Button variant="ghost" className="mb-6" data-testid="button-back">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stadiums
        </Button>
      </Link>

      <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Add New Stadium</CardTitle>
            <CardDescription>
              Configure the VIP lounge seating layout for this stadium
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stadium Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Cairo International Stadium"
                          data-testid="input-stadium-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rows"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Rows *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={50}
                            data-testid="input-rows"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Max 50 rows</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seatsPerRow"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seats Per Row *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={50}
                            data-testid="input-seats-per-row"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Max 50 seats</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Capacity:</span>
                    <span className="font-bold text-lg" data-testid="text-total-seats">
                      {totalSeats} seats
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Link href="/manager/stadiums">
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Stadium
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Grid className="h-5 w-5" />
              Layout Preview
            </CardTitle>
            <CardDescription>
              Visual representation of the VIP lounge seating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 py-2 px-4 bg-muted rounded-md text-center">
              <span className="text-sm font-medium text-muted-foreground">PITCH / FIELD</span>
            </div>

            {watchRows > 0 && watchSeatsPerRow > 0 ? (
              <div className="overflow-auto max-h-[300px]">
                <div className="flex flex-col gap-1 min-w-fit">
                  {Array.from({ length: Math.min(watchRows, 20) }, (_, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-1">
                      <span className="w-6 text-xs text-muted-foreground text-right">
                        {rowIndex + 1}
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: Math.min(watchSeatsPerRow, 25) }, (_, seatIndex) => (
                          <div
                            key={seatIndex}
                            className="w-3 h-3 rounded-sm border border-primary bg-transparent"
                          />
                        ))}
                        {watchSeatsPerRow > 25 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            +{watchSeatsPerRow - 25}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {watchRows > 20 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      +{watchRows - 20} more rows
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                Configure rows and seats to see preview
              </div>
            )}

            <div className="mt-4 pt-4 border-t flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm border border-primary" />
                <span>Available seat</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
