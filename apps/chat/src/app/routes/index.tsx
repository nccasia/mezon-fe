import loadable from '@loadable/component';
import { createBrowserRouter } from 'react-router-dom';

// Layouts
import AppLayout from '../layouts/AppLayout';
import GuessLayout from '../layouts/GuessLayout';
import MainLayout from '../layouts/MainLayout';

// Loaders
import { appLoader, shouldRevalidateApp } from '../loaders/appLoader';
import { authLoader, shouldRevalidateAuth } from '../loaders/authLoader';
import { channelLoader, shouldRevalidateChannel } from '../loaders/channelLoader';
import { clanLoader, shouldRevalidateServer } from '../loaders/clanLoader';
import { directLoader } from '../loaders/directLoader';
import { directMessageLoader } from '../loaders/directMessageLoader';
import { friendsLoader } from '../loaders/friendsLoader';
import { mainLoader, shouldRevalidateMain } from '../loaders/mainLoader';

import { loginLoader } from '../loaders/loginLoader';
import ClansRoutes from './ClanRoutes';
import DMRoutes from './DMRoutes';

// Pages
import { inviteLoader, shouldRevalidateInvite } from '../loaders/inviteLoader';
import ThreadsMain from '../pages/thread';
import ErrorRoutes from './ErrorRoutes';
import InitialRoutes from './InititalRoutes';
import ProtectedRoutes from './ProtectedRoutes';
import ThreadsRoutes from './ThreadsRoutes';

const Login = loadable(() => import('../pages/login'));
const LoginDesktop = loadable(() => import('../pages/loginDesktop'));
const Main = loadable(() => import('../pages/main'));
const DirectMain = loadable(() => import('../pages/directMessage'));
const InvitePage = loadable(() => import('../pages/invite'));
const ChannelMain = loadable(() => import('../pages/channel'));
const MemberMain = loadable(() => import('../pages/member'));
const ChannelIndex = loadable(() => import('../pages/channel/ChannelIndex'));
const ClanIndex = loadable(() => import('../pages/clan/ClanIndex'));
const DirectMessage = loadable(() => import('../pages/directMessage/DMPage'));
const DirectMessageIndex = loadable(() => import('../pages/directMessage/DMPage/DirectMessageIndex'));
const FriendsPage = loadable(() => import('../pages/directMessage/FriendsPage'));
const ClanLayout = loadable(() => import('../layouts/ClanLayout'));
const ChannelLayout = loadable(() => import('../layouts/ChannelLayout'));

// Components
export const routes = createBrowserRouter([
	{
		path: '',
		loader: appLoader,
		shouldRevalidate: shouldRevalidateApp,
		element: <AppLayout />,
		errorElement: <ErrorRoutes />,
		children: [
			// initial route to redirect to /chat
			{
				path: '',
				element: <InitialRoutes />,
			},
			{
				path: 'guess',
				element: <GuessLayout />,
				children: [
					{
						path: 'login',
						loader: loginLoader,
						element: <Login />,
					},
					{
						path: 'login-desktop',
						loader: loginLoader,
						element: <LoginDesktop />,
					},
				],
			},
			{
				path: 'chat',
				loader: authLoader,
				shouldRevalidate: shouldRevalidateAuth,
				element: <ProtectedRoutes />,
				children: [
					{
						path: '',
						loader: mainLoader,
						shouldRevalidate: shouldRevalidateMain,
						element: <MainLayout />,
						children: [
							{
								path: '',
								element: <Main />,
								children: [
									{
										path: 'clans',
										element: <ClansRoutes />,
										children: [
											{
												path: ':clanId',
												loader: clanLoader,
												shouldRevalidate: shouldRevalidateServer,
												element: <ClanLayout />,
												children: [
													{
														path: '',
														element: <ClanIndex />,
													},
													{
														path: 'member-safety',
														element: <MemberMain />,
													},
													{
														path: 'channels',
														element: <ChannelLayout />,
														children: [
															{
																path: '',
																element: <ChannelIndex />,
															},
															{
																path: ':channelId',
																loader: channelLoader,
																shouldRevalidate: shouldRevalidateChannel,
																element: <ChannelMain />,
																children: [
																	{
																		path: 'threads',
																		element: <ThreadsRoutes />,
																		children: [
																			{
																				path: ':threadId',
																				element: <ThreadsMain />,
																			},
																		],
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
										path: 'direct',
										element: <DirectMain />,
										loader: directLoader,
										children: [
											{
												path: '',
												element: <DirectMessageIndex />,
											},

											{
												path: 'friends',
												loader: friendsLoader,
												element: <FriendsPage />,
											},
											{
												path: 'message',
												element: <DMRoutes />,
												children: [
													{
														path: '',
														element: <DirectMessageIndex />,
													},
													{
														path: ':directId/:type',
														loader: directMessageLoader,
														shouldRevalidate: shouldRevalidateChannel,
														element: <DirectMessage />,
													},
												],
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
				path: 'invite',
				loader: authLoader,
				shouldRevalidate: shouldRevalidateAuth,
				element: <ProtectedRoutes />,
				children: [
					{
						path: ':inviteId',
						loader: inviteLoader,
						shouldRevalidate: shouldRevalidateInvite,
						element: <InvitePage />,
					},
				],
			},
			// fallback route, renders when no other route is matched
			{
				path: '*',
				element: <InitialRoutes />,
			},
		],
	},
]);
