// Phase 4 Task 6 — Mobile Bottom Navigation
// Phase 4 Task 9a — SSR-safe device check
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { useIsMobile } from '../utils/deviceDetect';
import './MobileBottomNav.scss';

const MobileBottomNav = () => {
	const isMobile = useIsMobile();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);

	const navItems = [
		{ href: '/', icon: HomeIcon, label: t('Home'), pathMatch: (p: string) => p === '/' },
		{ href: '/property', icon: SearchIcon, label: t('BottomNav search'), pathMatch: (p: string) => p === '/property' },
		{
			href: user?._id ? { pathname: '/mypage', query: { category: 'addProperty' } } : '/account/join',
			icon: AddCircleOutlineIcon,
			label: t('BottomNav post'),
			pathMatch: (_p: string) => false,
			isCenter: true,
		},
		{
			href: user?._id ? { pathname: '/mypage', query: { category: 'myFavorites' } } : '/account/join',
			icon: FavoriteBorderIcon,
			label: t('BottomNav saved'),
			pathMatch: (p: string) => p === '/mypage' && router.query?.category === 'myFavorites',
		},
		{
			href: user?._id ? '/mypage' : '/account/join',
			icon: PersonOutlineIcon,
			label: t('BottomNav profile'),
			pathMatch: (p: string) => p === '/mypage' && router.query?.category !== 'myFavorites' && router.query?.category !== 'addProperty',
		},
	];

	if (!isMobile) return null;

	return (
		<nav className="mobile-bottom-nav" role="navigation" aria-label="Bottom navigation">
			{navItems.map((item, i) => {
				const Icon = item.icon;
				const href = typeof item.href === 'object' && item.href !== null && !Array.isArray(item.href)
					? item.href
					: (item.href as string);
				const isActive = item.pathMatch(router.pathname) || (router.pathname === '/' && i === 0);
				const isCenter = item.isCenter;

				return (
					<Link
						key={i}
						href={href}
						className={`nav-item ${isActive ? 'active' : ''} ${isCenter ? 'center' : ''}`}
						aria-current={isActive ? 'page' : undefined}
					>
						{isCenter ? (
							<div className="center-btn">
								<AddCircleOutlineIcon sx={{ fontSize: 24 }} />
							</div>
						) : (
							<>
								<Icon sx={{ fontSize: 22 }} className="nav-icon" />
								<span className="nav-label">{item.label}</span>
							</>
						)}
					</Link>
				);
			})}
		</nav>
	);
};

export default MobileBottomNav;
