import { type RouteConfig,  layout,  route } from "@react-router/dev/routes";

export default [
    route("sign-in", 'routes/root/sign-in.tsx'),
     route("auth-redirect", 'routes/root/auth-redirect.tsx'),
    layout('routes/admin/admin-layout.tsx',[
        route("dashboard", 'routes/admin/dashboard.tsx'),
        route("all-users", 'routes/admin/all-users.tsx'),
        route("trips", 'routes/admin/trips.tsx'),
        route("trips/create", 'routes/admin/create-trip.tsx'),
        route("trips/:id", 'routes/admin/trip-detail.tsx'),
    ]),
    

] satisfies RouteConfig;