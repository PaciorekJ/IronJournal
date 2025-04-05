import { Outlet } from "@remix-run/react";
import { isAdmin } from "~/utils/auth.server";

export const loader = async () => {
    const isAnAdmin = isAdmin();

    if (!isAnAdmin) {
        throw new Response("Unauthorized", { status: 401 });
    }

    return {};
};

export default function Admin() {
    return <Outlet />;
}
