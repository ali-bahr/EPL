import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Seat {
  row: number;
  seat: number;
}

interface SeatMapProps {
  rows: number;
  seatsPerRow: number;
  reservedSeats: Seat[];
  selectedSeats: Seat[];
  onSeatSelect: (seats: Seat[]) => void;
  userReservedSeats?: Seat[];
  readOnly?: boolean;
}

export function SeatMap({
  rows,
  seatsPerRow,
  reservedSeats,
  selectedSeats,
  onSeatSelect,
  userReservedSeats = [],
  readOnly = false,
}: SeatMapProps) {
  const isSeatReserved = (row: number, seat: number) =>
    reservedSeats.some((s) => s.row === row && s.seat === seat);

  const isSeatSelected = (row: number, seat: number) =>
    selectedSeats.some((s) => s.row === row && s.seat === seat);

  const isUserReserved = (row: number, seat: number) =>
    userReservedSeats.some((s) => s.row === row && s.seat === seat);

  const handleSeatClick = (row: number, seat: number) => {
    if (readOnly || isSeatReserved(row, seat)) return;

    if (isSeatSelected(row, seat)) {
      onSeatSelect(selectedSeats.filter((s) => !(s.row === row && s.seat === seat)));
    } else {
      onSeatSelect([...selectedSeats, { row, seat }]);
    }
  };

  const getSeatStatus = (row: number, seat: number) => {
    if (isUserReserved(row, seat)) return "user-reserved";
    if (isSeatReserved(row, seat)) return "reserved";
    if (isSeatSelected(row, seat)) return "selected";
    return "available";
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-lg font-heading">VIP Lounge - Seat Selection</CardTitle>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm border-2 border-primary bg-transparent" />
              <span className="text-xs text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-primary" />
              <span className="text-xs text-muted-foreground">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-sm bg-muted" />
              <span className="text-xs text-muted-foreground">Reserved</span>
            </div>
            {userReservedSeats.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm bg-chart-4" />
                <span className="text-xs text-muted-foreground">Your Seats</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 py-2 px-4 bg-muted rounded-md text-center">
          <span className="text-sm font-medium text-muted-foreground">PITCH / FIELD</span>
        </div>

        <ScrollArea className="w-full">
          <div className="min-w-fit pb-4">
            <div className="flex flex-col gap-1">
              {Array.from({ length: rows }, (_, rowIndex) => (
                <div key={rowIndex} className="flex items-center gap-1">
                  <span className="w-8 text-xs text-muted-foreground text-right pr-2">
                    R{rowIndex + 1}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: seatsPerRow }, (_, seatIndex) => {
                      const status = getSeatStatus(rowIndex, seatIndex);
                      return (
                        <button
                          key={seatIndex}
                          onClick={() => handleSeatClick(rowIndex, seatIndex)}
                          disabled={readOnly || status === "reserved"}
                          className={cn(
                            "w-7 h-7 rounded-sm text-xs font-medium transition-all",
                            "flex items-center justify-center",
                            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                            {
                              "border-2 border-primary bg-transparent text-foreground cursor-pointer":
                                status === "available" && !readOnly,
                              "border-2 border-primary bg-transparent text-foreground cursor-default":
                                status === "available" && readOnly,
                              "bg-primary text-primary-foreground cursor-pointer":
                                status === "selected",
                              "bg-muted text-muted-foreground cursor-not-allowed":
                                status === "reserved",
                              "bg-chart-4 text-white cursor-default":
                                status === "user-reserved",
                            }
                          )}
                          data-testid={`seat-${rowIndex}-${seatIndex}`}
                        >
                          {seatIndex + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        {!readOnly && selectedSeats.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Selected:</span>
              {selectedSeats.map((seat) => (
                <Badge key={`${seat.row}-${seat.seat}`} variant="default">
                  R{seat.row + 1}-S{seat.seat + 1}
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSeatSelect([])}
              data-testid="button-clear-selection"
            >
              Clear Selection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
