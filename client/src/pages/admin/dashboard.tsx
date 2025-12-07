import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, UserX, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";

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

export default function AdminDashboard() {
  const { data: response, isLoading } = useQuery<UsersResponse>({
    queryKey: ["/api/v1/AdminContorller/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/v1/AdminContorller/users");
      const data = await res.json();
      console.log('Dashboard users data:', data);
      return data;
    },
    refetchOnMount: true,
    staleTime: 0, // Always fetch fresh data
  });

  const users = response?.data?.items || [];
  console.log('Dashboard - All users:', users.length);
  const pendingUsers = users.filter((u) => u.roles.length === 0);
  console.log('Dashboard - Pending users:', pendingUsers.length, pendingUsers);
  const approvedUsers = users.filter((u) => u.roles.length > 0);
  console.log('Dashboard - Approved users:', approvedUsers.length);
  const managers = users.filter((u) => u.roles.includes("manager"));
  console.log('Dashboard - Managers:', managers.length);

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2" data-testid="text-page-title">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage users and monitor platform activity
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-users">
              {isLoading ? "-" : response?.data?.totalCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2" data-testid="stat-pending-users">
              {isLoading ? "-" : pendingUsers.length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Approved Users</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary" data-testid="stat-approved-users">
              {isLoading ? "-" : approvedUsers.length}
            </div>
            <p className="text-xs text-muted-foreground">Active accounts</p>
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">EFA Managers</CardTitle>
            <UserX className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4" data-testid="stat-managers">
              {isLoading ? "-" : managers.length}
            </div>
            <p className="text-xs text-muted-foreground">Active managers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Users waiting for account approval</CardDescription>
            </div>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pendingUsers.length > 0 ? (
              <div className="space-y-3">
                {pendingUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50"
                    data-testid={`pending-user-${user.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant={user.roles.includes("manager") ? "default" : "secondary"}>
                      {user.roles.length > 0 ? (user.roles.includes("manager") ? "Manager" : "Fan") : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCheck className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No pending approvals</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start" data-testid="link-manage-users">
                <Users className="mr-2 h-4 w-4" />
                Manage All Users
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <Link href="/matches">
              <Button variant="outline" className="w-full justify-start" data-testid="link-view-matches">
                <Clock className="mr-2 h-4 w-4" />
                View Match Schedule
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
