import React from "react";
import { createBrowserRouter } from "react-router-dom";

// Layouts
import GuessLayout from "../layouts/GuessLayout";
import MainLayout from "../layouts/MainLayout";
import AppLayout from "../layouts/AppLayout";
import ServerLayout from "../layouts/ServerLayout";

// Pages
import Main from "../pages/main";
import Chanel from "../pages/channel";
import Direct from "../pages/directMessage";
import Login from "../pages/login";
import ProtectedRoutes from "./ProtectedRoutes";
import InitialRoutes from "./InititalRoutes";
import ErrorRoutes from "./ErrorRoutes";
import InvitePage from "../pages/invite";

// Loaders
import { authLoader, shouldRevalidateAuth } from "../loaders/authLoader";
import { mainLoader, shouldRevalidateMain } from "../loaders/mainLoader";
import { serverLoader, shouldRevalidateServer } from "../loaders/serverLoader";
import { channelLoader, dmGroupMessaage, shouldRevalidateChannel } from "../loaders/channelLoader";
import ClansRoutes from "./ClanRoutes";
import ChannelsRoutes from "./ChannelsRoutes";
import { ClanIndex } from "../pages/clan/ClanIndex";
import { ChannelIndex } from "../pages/channel/ChannelIndex";

// Components
export const routes = createBrowserRouter([
    {
        path: "",
        element: <AppLayout />,
        errorElement: <ErrorRoutes />,
        children: [
            // initial route to redirect to /chat
            {
                path: "",
                element: <InitialRoutes />,
            },
            {
                path: "guess",
                element: <GuessLayout />,
                children: [
                    {
                        path: "login",
                        element: <Login />,
                    },
                ],
            },
            {
                path: "chat",
                loader: authLoader,
                shouldRevalidate: shouldRevalidateAuth,
                element: <ProtectedRoutes />,
                children: [
                    {
                        path: "",
                        loader: mainLoader,
                        shouldRevalidate: shouldRevalidateMain,
                        element: <MainLayout />,
                        children: [
                            {
                                path: "",
                                element: <Main />,
                                children: [
                                    {
                                        path: "servers",
                                        element: <ClansRoutes />,
                                        children: [
                                            {
                                                path: ":serverId",
                                                loader: serverLoader,
                                                shouldRevalidate: shouldRevalidateServer,
                                                element: <ServerLayout />,
                                                children: [
                                                    {
                                                        path: "",
                                                        element: <ClanIndex />,
                                                    },
                                                    {
                                                        path: "channels",
                                                        element: <ChannelsRoutes />,
                                                        children: [
                                                            {
                                                                path: "",
                                                                element: <ChannelIndex />,
                                                            },
                                                            {
                                                                path: ":channelId",
                                                                loader: channelLoader,
                                                                shouldRevalidate: shouldRevalidateChannel,
                                                                element: <Chanel />,
                                                            },
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        path: "direct",
                                        // element: <Direct />,
                                        children: [
                                            {
                                                shouldRevalidate: shouldRevalidateChannel,
                                                path: ":dmGroupId",
                                                loader: dmGroupMessaage,
                                                element: <Direct />,
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                path: "invite",
                loader: authLoader,
                children: [
                    {
                        path: ":inviteId",
                        // TODO: add loader
                        element: <InvitePage />,
                    },
                ],
            },
            // fallback route, renders when no other route is matched
            {
                path: "*",
                element: <InitialRoutes />,
            },
        ],
    },
]);
