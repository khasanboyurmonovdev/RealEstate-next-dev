// Phase 4 Task 4
// Phase 4 Task 8 — next/image migration
import React from 'react';
import Image from 'next/image';
import { Stack } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PlaceIcon from '@mui/icons-material/Place';
import StarIcon from '@mui/icons-material/Star';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import { Property } from '../../types/property/property';
import Link from 'next/link';
import { formatUZSShort } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import './property-card.scss';

export type PropertyCardVariant = 'default' | 'horizontal' | 'compact';

interface PropertyCardType {
	property?: Property;
	likePropertyHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
	variant?: PropertyCardVariant;
	isLoading?: boolean;
}

const getListingBadge = (property: Property, constructedYearsAgo?: number) => {
	if (constructedYearsAgo !== undefined && constructedYearsAgo <= 2) return { type: 'new', label: 'Yangi bino' };
	if (property?.propertyRent) return { type: 'rent', label: "Ijara" };
	return { type: 'sale', label: "Sotish" };
};

const PropertyCard = (props: PropertyCardType) => {
	const { property, likePropertyHandler, myFavorites, recentlyVisited, variant = 'default', isLoading = false } = props;
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const images = property?.propertyImages || (property as any)?.images;
	const imagePath = images?.[0] ? `${REACT_APP_API_URL}/${images[0]}` : null;

	const isFavorited = myFavorites || (property?.meLiked && property.meLiked[0]?.myFavorite);

	const constructedYearsAgo =
		property?.constructedAt
			? new Date().getFullYear() - new Date(property.constructedAt).getFullYear()
			: undefined;

	const badge = property ? getListingBadge(property, constructedYearsAgo) : null;

	const handleFavClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (likePropertyHandler && user) likePropertyHandler(user, property?._id);
	};

	const detailHref = property?._id ? { pathname: '/property/detail', query: { id: property._id } } : '#';
	const ownerName = property?.memberData?.memberNick || t('Card owner default');
	const ownerImage = property?.memberData?.memberImage;
	const ownerInitials = ownerName?.slice(0, 2).toUpperCase() || '?';
	const rating = 4.9;
	const reviewCount = 12;

	if (isLoading) {
		return (
			<div className={`property-card is-loading variant-${variant}`}>
				<div className="card-img-wrap">
					<div className="card-img-inner skeleton-block skeleton-img" />
				</div>
				<div className="card-content">
					<div className="skeleton-block skeleton-title" />
					<div className="skeleton-block skeleton-location" />
					<div className="skeleton-specs">
						<div className="skeleton-block skeleton-spec" />
						<div className="skeleton-block skeleton-spec" />
						<div className="skeleton-block skeleton-spec" />
					</div>
					<div className="skeleton-block" style={{ height: 1, marginBottom: 12 }} />
					<div className="skeleton-footer">
						<div className="skeleton-block skeleton-footer-left" />
						<div className="skeleton-block skeleton-footer-right" />
					</div>
				</div>
			</div>
		);
	}

	if (!property) return null;

	return (
		<Link href={detailHref} passHref legacyBehavior>
			<a className={`property-card variant-${variant}`} style={{ textDecoration: 'none', color: 'inherit' }}>
				<div className="card-img-wrap">
				<div className={`card-img-inner ${!imagePath ? 'no-image' : ''}`}>
					{imagePath ? (
						<Image
							src={imagePath}
							alt={property?.propertyTitle || ''}
							fill
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
							style={{ objectFit: 'cover' }}
							onError={(e) => { e.currentTarget.src = '/images/placeholder-property.svg'; }}
						/>
					) : null}
				</div>
					{property?.verificationStatus === 'VERIFIED' && (
						<span className="verification-badge verification-verified">✓ Tasdiqlangan</span>
					)}
					{(property?.verificationStatus === 'PENDING' || property?.verificationStatus === 'UNDER_REVIEW') && (
						<span className="verification-badge verification-pending">⏳ Tekshirilmoqda</span>
					)}
					{badge && (
						<span className={`card-badge badge-${badge.type}`}>
							{ badge.type === 'rent' ? t('Card badge rent') : badge.type === 'sale' ? t('Card badge sale') : t('Card badge new') }
						</span>
					)}
					{likePropertyHandler && !recentlyVisited && (
						<button
							type="button"
							className={`fav-btn ${isFavorited ? 'is-favorited' : ''}`}
							onClick={handleFavClick}
							aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
						>
							{isFavorited ? (
								<FavoriteIcon sx={{ fill: 'currentColor' }} />
							) : (
								<FavoriteBorderIcon />
							)}
						</button>
					)}
					{variant === 'default' && (
						<div className="card-price-overlay">
							<span className="card-price-value">{formatUZSShort(property?.propertyPrice ?? 0)}</span>
							<span className="card-price-period">/oy</span>
						</div>
					)}
				</div>
				<div className="card-content">
					{variant === 'horizontal' && (
						<span className="card-price-content">
							{formatUZSShort(property?.propertyPrice ?? 0)}
							<span className="card-price-period"> /oy</span>
						</span>
					)}
					<h3 className="card-title">{property?.propertyTitle || t('No title available')}</h3>
					<div className="card-location">
						<PlaceIcon />
						<span>
							{property?.propertyAddress && (property.propertyLocation || (property as any)?.district)
								? `${property.propertyAddress}, ${property.propertyLocation || (property as any)?.district}`
								: property?.propertyLocation || (property as any)?.district || property?.propertyAddress || '—'}
						</span>
					</div>
					{variant !== 'compact' && (
						<>
							<div className="card-specs">
								<span className="card-spec">
									<BedIcon />
									{property?.propertyRooms ?? 0} {t('Card rooms')}
								</span>
								<span className="card-spec">
									<BathtubIcon />
									{t('Card bathroom')}
								</span>
								<span className="card-spec">
									<SquareFootIcon />
									{property?.propertySquare ?? 0} m²
								</span>
							</div>
							<div className="card-divider" />
							<div className="card-footer">
								<div className="card-owner">
									<div className="card-avatar">
								{ownerImage ? (
										<Image
											src={`${REACT_APP_API_URL}/${ownerImage}`}
											alt=""
											width={28}
											height={28}
											style={{ objectFit: 'cover' }}
										/>
									) : (
										ownerInitials
									)}
									</div>
									<div className="card-owner-info">
										<span className="card-owner-name">{ownerName}</span>
										<span className="card-owner-label">{t('Card owner label')}</span>
									</div>
								</div>
								<div className="card-rating">
									<StarIcon className="star-icon" />
									<span className="rating-value">{rating}</span>
									<span className="rating-count">({reviewCount} {t('Card reviews')})</span>
								</div>
							</div>
						</>
					)}
				</div>
			</a>
		</Link>
	);
};

export default PropertyCard;
