import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, UserCheck, UserX, Trash2, Loader2, Users, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  interface UsersResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
      items: Array<{
        id: string;
        userName: string;
        email: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        city: string;
        address: string | null;
        gender: string;
        roles: string[];
      }>;
      pageIndex: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
    };
  }

  const { data: response, isLoading } = useQuery<UsersResponse>({
    queryKey: ["/api/v1/AdminContorller/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/AdminContorller/users");
      return res.json();
    },
  });

  const users = response?.data?.items || [];

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("PATCH", `/api/v1/AdminContorller/confirm-account/${userId}`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/AdminContorller/users"] });
      if (data.success) {
        toast({ title: "User approved successfully", description: data.message });
      } else {
        toast({ title: "Failed to approve user", description: data.message, variant: "destructive" });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Failed to approve user", description: error.message, variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("PATCH", `/api/v1/AdminContorller/reject-account/${userId}`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/AdminContorller/unconfirmed-accounts"] });
      if (data.success) {
        toast({ title: "User rejected", description: data.message });
      } else {
        toast({ title: "Failed to reject user", description: data.message, variant: "destructive" });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Failed to reject user", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/v1/AdminContorller/users/${userId}`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/AdminContorller/unconfirmed-accounts"] });
      if (data?.success !== false) {
        toast({ title: "User deleted successfully" });
      } else {
        toast({ title: "Failed to delete user", description: data.message, variant: "destructive" });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete user", description: error.message, variant: "destructive" });
    },
  });

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Check if user has the specified role
    const userRole = user.roles.length > 0 ? user.roles[0] : "fan";
    const matchesRole = roleFilter === "all" || userRole === roleFilter;
    
    // Users with no roles are unconfirmed/pending
    const userStatus = user.roles.length === 0 ? "pending" : "approved";
    const matchesStatus = statusFilter === "all" || userStatus === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (roles: string[]) => {
    if (roles.length === 0) {
      return <Badge variant="secondary" className="bg-chart-2/20 text-chart-2 border-chart-2/30">Pending</Badge>;
    }
    return <Badge variant="default">Approved</Badge>;
  };

  const getRoleBadge = (roles: string[]) => {
    if (roles.length === 0) {
      return <Badge variant="secondary">Unconfirmed</Badge>;
    }
    const role = roles[0];
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Admin</Badge>;
      case "manager":
        return <Badge variant="default">Manager</Badge>;
      default:
        return <Badge variant="secondary">Fan</Badge>;
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2" data-testid="text-page-title">
          User Management
        </h1>
        <p className="text-muted-foreground">
          Approve, reject, or remove user accounts
        </p>
      </div>

      <Card className="overflow-visible">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-role-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="fan">Fan</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {user.firstName[0]}
                              {user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.userName}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.roles)}</TableCell>
                      <TableCell>{getStatusBadge(user.roles)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {/* Only show approve/reject for unconfirmed accounts (no roles) */}
                          {user.roles.length === 0 && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => approveMutation.mutate(user.id)}
                                disabled={approveMutation.isPending}
                                data-testid={`button-approve-${user.id}`}
                              >
                                <UserCheck className="h-4 w-4 text-primary" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => rejectMutation.mutate(user.id)}
                                disabled={rejectMutation.isPending}
                                data-testid={`button-reject-${user.id}`}
                              >
                                <UserX className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                          {/* Allow deletion for non-admin users */}
                          {!user.roles.includes("admin") && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  data-testid={`button-delete-${user.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.firstName} {user.lastName}?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(user.id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Users Found</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "No users have registered yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
