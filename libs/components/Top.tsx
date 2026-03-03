// Phase 4 Task 2
// Phase 4 Task 8 — next/image migration
import React, { useCallback, useEffect } from 'react';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box, Typography } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import Image from 'next/image';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { Messages, REACT_APP_API_URL } from '../config';
import { RippleBadge } from '../../scss/MaterialTheme/styled';
import { UPDATE_NOTIFICATION } from '../../apollo/user/query';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../sweetAlert';
import { notificationsVar } from '../../apollo/store';

const Top = () => {
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const router = useRouter();
	const [lang, setLang] = useState<string | null>('uz');
	const [isScrolled, setIsScrolled] = useState(false);
	const [logoutAnchor, setLogoutAnchor] = useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const [anchorEl3, setAnchorEl3] = useState<null | HTMLElement>(null);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [notificationCount, setNotificationCount] = useState<number>(0);
	const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
	const openNotifications = Boolean(anchorEl3);

	const [updateNotification] = useMutation(UPDATE_NOTIFICATION);
	const notificationsList = useReactiveVar(notificationsVar);

	useEffect(() => {
		setNotifications(notificationsList?.list ?? []);
		setNotificationCount(notificationsList?.metaCounter?.[0]?.total ?? 0);
		const stored = localStorage.getItem('locale');
		if (!stored) {
			localStorage.setItem('locale', 'uz');
			setLang('uz');
		} else {
			setLang(stored === 'kr' ? 'uz' : stored);
		}
	}, [router, notificationsList, user]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 10);
		handleScroll();
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const updateNotificationHandler = async (user: any, notificationId: any) => {
		try {
			if (!notificationId) return;
			if (!user._id) throw new Error(Messages.error2);
			await updateNotification({ variables: { input: notificationId } });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const langChoice = useCallback(
		async (localeId: string) => {
			setLang(localeId);
			localStorage.setItem('locale', localeId);
			await router.push(router.asPath, router.asPath, { locale: localeId });
		},
		[router],
	);

	const StyledMenu = styled((props: MenuProps) => (
		<Menu
			elevation={0}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			{...props}
		/>
	))(({ theme }) => ({
		'& .MuiPaper-root': {
			top: '72px !important',
			borderRadius: 6,
			marginTop: theme.spacing(1),
			minWidth: 160,
			color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
			boxShadow: '0 4px 16px rgba(0,0,0,0.09)',
			'& .MuiMenu-list': { padding: '4px 0' },
			'& .MuiMenuItem-root': {
				'& .MuiSvgIcon-root': { fontSize: 18, marginRight: theme.spacing(1.5) },
				'&:active': { backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity) },
			},
		},
	}));

	const navLinks = [
		{ href: '/', label: t('Home'), match: (p: string) => p === '/' },
		{ href: '/property', label: t('Properties'), match: (p: string) => p === '/property' || p.startsWith('/property/') },
		{ href: '/agent', label: t('Agents'), match: (p: string) => p === '/agent' },
		{ href: '/community?articleCategory=FREE', label: t('Community'), match: (p: string) => p.startsWith('/community') },
		...(user?._id ? [{ href: '/mypage', label: t('My Page'), match: (p: string) => p === '/mypage' }] : []),
		{ href: '/cs', label: t('CS'), match: (p: string) => p === '/cs' },
	];

	const closeMobileDrawer = () => setMobileDrawerOpen(false);

	return (
		<Stack className="navbar">
			<Stack className={`navbar-main ${isScrolled ? 'scrolled' : ''}`}>
				<Stack className="navbar-container">
					<Link href="/" className="logo-box" onClick={closeMobileDrawer}>
						<span className="logo-text">Ijaraly</span>
						<span className="logo-accent" />
					</Link>
					<Box className="nav-links">
						{navLinks.map((link) => (
							<Link key={link.href} href={link.href} className={link.match(router.pathname) ? 'active' : ''}>
								{link.label}
							</Link>
						))}
					</Box>
					<button
						type="button"
						className="hamburger-btn"
						onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
						aria-label="Toggle menu"
					>
						{mobileDrawerOpen ? <CloseIcon /> : <MenuIcon />}
					</button>
					<Box className="actions-box">
						<div className="lang-pill">
							{['uz', 'ru', 'en'].map((localeId) => (
								<button
									key={localeId}
									type="button"
									className={`lang-pill-item ${lang === localeId ? 'active' : ''}`}
									onClick={() => langChoice(localeId)}
								>
									{localeId === 'uz' ? 'UZ' : localeId === 'ru' ? 'RU' : 'EN'}
								</button>
							))}
						</div>
						{user?._id ? (
							<>
								<div className="login-user" onClick={(e: any) => setLogoutAnchor(e.currentTarget)} role="button" tabIndex={0}>
									<Image
									src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
									alt=""
									width={40}
									height={40}
									style={{ objectFit: 'cover', borderRadius: '50%', display: 'block' }}
									unoptimized={!user?.memberImage}
								/>
								</div>
								<Menu anchorEl={logoutAnchor} open={logoutOpen} onClose={() => setLogoutAnchor(null)} sx={{ mt: '5px' }}>
									<MenuItem onClick={() => logOut()}>
										<Logout fontSize="small" sx={{ mr: 1 }} />
										Logout
									</MenuItem>
								</Menu>
							</>
						) : (
							<Link href="/account/join">
								<button type="button" className="btn-login">
									{t('Login')}
								</button>
							</Link>
						)}
						{user?._id && (
							<Button disableRipple className="btn-notification" onClick={(e) => setAnchorEl3(e.currentTarget)}>
								<RippleBadge badgeContent={notificationCount} style={{ transform: 'scale(0.65)', margin: '-18px 0 0 0' }}>
									<NotificationsOutlinedIcon className="notification-icon" />
								</RippleBadge>
							</Button>
						)}
						<Link href="/mypage?category=addProperty">
							<button type="button" className="btn-post-listing">
								{t('Post listing')}
							</button>
						</Link>
					</Box>
				</Stack>
			</Stack>
			<Stack className={`mobile-drawer ${mobileDrawerOpen ? 'open' : ''}`} onClick={closeMobileDrawer}>
				<Stack className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
					<Stack className="mobile-nav-links">
						{navLinks.map((link) => (
							<Link key={link.href} href={link.href} className={link.match(router.pathname) ? 'active' : ''} onClick={closeMobileDrawer}>
								{link.label}
							</Link>
						))}
					</Stack>
					<Stack className="mobile-actions">
						<Link href="/account/join" onClick={closeMobileDrawer}>
							<button type="button" className="btn-login">
								{t('Login')}
							</button>
						</Link>
						<Link href="/mypage?category=addProperty" onClick={closeMobileDrawer}>
							<button type="button" className="btn-post-listing">
								{t('Post listing')}
							</button>
						</Link>
					</Stack>
					<div className="mobile-lang-toggle">
						{['uz', 'ru', 'en'].map((localeId) => (
							<button
								key={localeId}
								type="button"
								className={`lang-pill-item ${lang === localeId ? 'active' : ''}`}
								onClick={() => langChoice(localeId)}
							>
								{localeId === 'uz' ? 'UZ' : localeId === 'ru' ? 'RU' : 'EN'}
							</button>
						))}
					</div>
				</Stack>
			</Stack>
			<StyledMenu anchorEl={anchorEl3} open={openNotifications} onClose={() => setAnchorEl3(null)} sx={{ position: 'absolute' }}>
				{notifications?.length > 0 ? (
					notifications.map((n: any) => (
						<MenuItem key={n._id} disableRipple onClick={() => updateNotificationHandler(user, n._id)} className="notification-item">
							<Typography variant="body2" fontWeight={500}>{n.notificationTitle}</Typography>
							<p className="notification-desc">{n.notificationDesc}</p>
						</MenuItem>
					))
				) : (
					<MenuItem disableRipple onClick={() => setAnchorEl3(null)}>
						<Typography>No Notifications Yet</Typography>
					</MenuItem>
				)}
			</StyledMenu>
		</Stack>
	);
};

export default withRouter(Top);
