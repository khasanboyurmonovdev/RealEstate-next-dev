// Phase 4 Task 5 — Ijaraly Property Detail Redesign
// Phase 4 Task 8 — next/image migration
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	Radio,
	RadioGroup,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import Review from '../../libs/components/property/Review';
import PropertyCard from '../../libs/components/property/PropertyCard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PlaceIcon from '@mui/icons-material/Place';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ShareIcon from '@mui/icons-material/Share';
import PhoneIcon from '@mui/icons-material/Phone';
import ChatIcon from '@mui/icons-material/Chat';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BathtubIcon from '@mui/icons-material/Bathtub';
import BedIcon from '@mui/icons-material/Bed';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import LayersIcon from '@mui/icons-material/Layers';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Property } from '../../libs/types/property/property';
import moment from 'moment';
import { formatUZS, formatUZSShort } from '../../libs/utils';
import { REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Pagination as MuiPagination } from '@mui/material';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { CREATE_COMMENT, CREATE_REPORT, LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { GET_COMMENTS, GET_PROPERTIES, GET_PROPERTY, GET_PROPERTY_AI_SUMMARY } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { topPropertyRank } from '../../libs/config';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyDetail: NextPage = ({ initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const [propertyId, setPropertyId] = useState<string | null>(null);
	const [property, setProperty] = useState<Property | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [destinationProperties, setDestinationProperties] = useState<Property[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [propertyComments, setPropertyComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.PROPERTY,
		commentContent: '',
		commentRefId: '',
	});
	const [descExpanded, setDescExpanded] = useState(false);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const [mobileSlideIndex, setMobileSlideIndex] = useState(0);
	const [phoneRevealed, setPhoneRevealed] = useState(false);
	const [reportOpen, setReportOpen] = useState(false);
	const [reportReason, setReportReason] = useState('');
	const [reportDesc, setReportDesc] = useState('');
	const [aiSummaryLang, setAiSummaryLang] = useState<'uz' | 'ru'>('uz');
	const [aiSummaryVisible, setAiSummaryVisible] = useState(false);

	const images = property?.propertyImages ?? (property as any)?.images ?? [];
	const location = property?.propertyLocation ?? (property as any)?.district ?? '';
	const isPremium = property?.propertyRank != null && property.propertyRank >= topPropertyRank;

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
	const [createComment] = useMutation(CREATE_COMMENT);
	const [createReport, { loading: reportLoading }] = useMutation(CREATE_REPORT);

	const {
		loading: getPropertyLoading,
		refetch: getPropertyRefetch,
	} = useQuery(GET_PROPERTY, {
		fetchPolicy: 'network-only',
		variables: { input: propertyId },
		skip: !propertyId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const p = data.getProperty;
			setProperty(p);
			const imgs = p?.images ?? p?.propertyImages ?? [];
			if (imgs?.[0]) setSlideImage(imgs[0]);
		},
	});

	const {
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 6,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {
					locationList: location ? [location] : [],
				},
			},
		},
		skip: !propertyId || !property,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setDestinationProperties(data.getProperties?.list ?? []);
		},
	});

	const {
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setPropertyComments(data.getComments?.list ?? []);
			setCommentTotal(data.getComments?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const { data: aiSummaryData, loading: aiSummaryLoading } = useQuery(GET_PROPERTY_AI_SUMMARY, {
		variables: { propertyId: propertyId ?? '' },
		skip: !propertyId || !aiSummaryVisible,
		fetchPolicy: 'cache-first',
	});

	const aiSummary = aiSummaryData?.getPropertyAiSummary;

	/** LIFECYCLES **/
	useEffect(() => {
		const id = router.query.id as string;
		if (id) {
			setPropertyId(id);
			setCommentInquiry((prev) => ({ ...prev, search: { commentRefId: id } }));
			setInsertCommentData((prev) => ({ ...prev, commentRefId: id }));
		}
	}, [router.query.id]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ input: commentInquiry });
		}
	}, [commentInquiry]);

	/** HANDLERS ***/
	const likePropertyHandler = useCallback(
		async (u: T, id: string) => {
			try {
				if (!id) return;
				if (!u._id) throw new Error(Message.NOT_AUTHENTICATED);
				await likeTargetProperty({ variables: { input: id } });
				await getPropertyRefetch({ variables: { input: id } });
				const loc = property?.propertyLocation ?? (property as any)?.district;
				await getPropertiesRefetch({
					variables: {
						input: {
							page: 1,
							limit: 6,
							sort: 'createdAt',
							direction: Direction.DESC,
							search: { locationList: loc ? [loc] : [] },
						},
					},
				});
				await sweetTopSmallSuccessAlert('success', 800);
			} catch (err: any) {
				sweetMixinErrorAlert(err.message).then();
			}
		},
		[property, likeTargetProperty, getPropertyRefetch, getPropertiesRefetch]
	);

	const changeImageHandler = (image: string) => setSlideImage(image);

	const commentPaginationChangeHandler = (event: ChangeEvent<unknown>, value: number) => {
		setCommentInquiry((prev) => ({ ...prev, page: value }));
	};

	const createCommantHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await createComment({ variables: { input: insertCommentData } });
			setInsertCommentData((prev) => ({ ...prev, commentContent: '' }));
			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			await sweetErrorHandling(err).then();
		}
	};

	const shareHandler = () => {
		if (typeof navigator !== 'undefined' && navigator.share) {
			navigator.share({
				title: property?.propertyTitle,
				url: window.location.href,
			}).catch(() => {});
		} else {
			navigator.clipboard?.writeText(window.location.href).then(() => sweetTopSmallSuccessAlert('Copied', 600));
		}
	};

	const copyAddressHandler = () => {
		const addr = `${location}${(property as any)?.city ? `, ${(property as any).city}` : ''}`;
		navigator.clipboard?.writeText(addr).then(() => sweetTopSmallSuccessAlert('Copied', 600));
	};

	const handleReportOpen = () => {
		if (!user?._id) {
			sweetMixinErrorAlert('Shikoyat qilish uchun tizimga kiring');
			return;
		}
		setReportReason('');
		setReportDesc('');
		setReportOpen(true);
	};

	const handleReportSubmit = async () => {
		if (!reportReason) return;
		try {
			await createReport({
				variables: {
					input: {
						propertyId: property?._id,
						reason: reportReason,
						description: reportDesc.trim() || undefined,
					},
				},
			});
			setReportOpen(false);
			await sweetTopSmallSuccessAlert('Shikoyatingiz qabul qilindi');
		} catch (err: any) {
			const msg = err?.graphQLErrors?.[0]?.message || err.message || '';
			if (msg.includes('ALREADY_REPORTED')) {
				await sweetMixinErrorAlert('Siz bu e\'lonni allaqachon shikoyat qilgansiz');
			} else {
				await sweetErrorHandling(err);
			}
		}
	};

	const openLightbox = (idx: number) => {
		setLightboxIndex(idx);
		setLightboxOpen(true);
	};

	const closeLightbox = () => setLightboxOpen(false);

	const lightboxPrev = () => setLightboxIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
	const lightboxNext = () => setLightboxIndex((i) => (i >= images.length - 1 ? 0 : i + 1));

	useEffect(() => {
		if (!lightboxOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeLightbox();
			if (e.key === 'ArrowLeft') lightboxPrev();
			if (e.key === 'ArrowRight') lightboxNext();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [lightboxOpen, images.length]);

	const daysAgo = property?.createdAt ? moment().diff(moment(property.createdAt), 'days') : 0;
	const postedText = daysAgo === 0 ? t('Detail posted today') : `${daysAgo} ${t('Detail days ago')}`;
	const fullAddress = `${location}${(property as any)?.propertyAddress ? `, ${(property as any).propertyAddress}` : ''}`;
	const memberPhone = property?.memberData?.memberPhone ?? '';

	const detailRows = [
		{ label: "Qavat", value: (property as any)?.propertyFloor ?? '—' },
		{ label: "Umumiy qavatlar", value: (property as any)?.totalFloors ?? '—' },
		{ label: "Xonalar", value: property?.propertyRooms ?? (property as any)?.rooms ?? '—' },
		{ label: "Vannaxona", value: property?.propertyBeds ?? (property as any)?.bathrooms ?? '—' },
		{ label: "Maydon", value: property?.propertySquare ? `${property.propertySquare} m²` : '—' },
		{ label: "Mebel", value: (property as any)?.furniture ? 'Ha' : 'Yo\'q' },
		{ label: "Texnika", value: (property as any)?.appliances ? 'Ha' : 'Yo\'q' },
		{ label: "Internet", value: (property as any)?.internet ? 'Ha' : 'Yo\'q' },
		{ label: "Konditsioner", value: (property as any)?.ac ? 'Ha' : 'Yo\'q' },
		{ label: "Bino turi", value: (property as any)?.propertyType ?? property?.propertyType ?? '—' },
		{ label: "Holati", value: (property as any)?.condition ?? '—' },
	];

	const isFavorited = property?.meLiked?.[0]?.myFavorite ?? false;

	if (getPropertyLoading) {
		return (
			<Stack sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: 400 }}>
				<CircularProgress size="4rem" />
			</Stack>
		);
	}

	if (!property) return null;

	return (
		<div id="property-detail-page">
			<div className="detail-container">
				{/* Breadcrumb */}
				<nav className="detail-breadcrumb" aria-label="Breadcrumb">
					<Link href="/">{t('Home')}</Link>
					<span className="sep">/</span>
					<Link href="/property">{t('Detail breadcrumb listings')}</Link>
					<span className="sep">/</span>
					{location && (
						<>
							<span>{location}</span>
							<span className="sep">/</span>
						</>
					)}
					<span className="active">{property?.propertyTitle ?? t('No title available')}</span>
				</nav>

				<div className="detail-layout">
					<div className="detail-main">
						{/* Gallery Desktop */}
						<div className="detail-gallery-desktop">
					<div className="main-wrap" style={{ position: 'relative' }} onClick={() => images.length > 0 && openLightbox(Math.max(0, images.indexOf(slideImage)))}>
							<Image
								className="main-img"
								src={slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/images/placeholder-property.svg'}
								alt="Main"
								fill
								sizes="(max-width: 1024px) 100vw, 60vw"
								style={{ objectFit: 'cover' }}
								priority
								onError={(e) => { e.currentTarget.src = '/images/placeholder-property.svg'; }}
							/>
								<div className="gallery-badges">
									<span className={`badge-listing ${property?.propertyRent ? 'badge-rent' : 'badge-sale'}`}>
										{property?.propertyRent ? "Ijara" : "Sotish"}
									</span>
									{isPremium && (
										<span className="badge-listing badge-premium">
											<StarIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
											Premium
										</span>
									)}
								</div>
							</div>
							<div className="thumbs-wrap">
								{(images.length ? images : ['']).slice(0, 4).map((img, i) => (
								<div
									key={i}
									className={`thumb-box ${slideImage === img ? 'active' : ''}`}
									style={{ position: 'relative' }}
									onClick={() => (i === 3 && images.length > 4 ? openLightbox(3) : img && changeImageHandler(img))}
								>
									<Image
										src={img ? `${REACT_APP_API_URL}/${img}` : '/images/placeholder-property.svg'}
										alt=""
										fill
										sizes="(max-width: 1024px) 50vw, 20vw"
										style={{ objectFit: 'cover' }}
									/>
										{i === 3 && images.length > 4 && (
											<div className="thumb-more">+{images.length - 4} foto</div>
										)}
									</div>
								))}
							</div>
						</div>

						{/* Gallery Mobile */}
						<div className="detail-gallery-mobile">
							<div
								className="gallery-scroll"
								ref={(el) => {
									if (el) el.scrollLeft = mobileSlideIndex * el.clientWidth;
								}}
								onScroll={(e) => {
									const sx = (e.target as HTMLElement).scrollLeft;
									const w = (e.target as HTMLElement).clientWidth;
									setMobileSlideIndex(Math.round(sx / w));
								}}
							>
						{images.length ? images.map((img, i) => (
								<div key={i} className="slide-item" style={{ position: 'relative' }}>
									<Image
										src={`${REACT_APP_API_URL}/${img}`}
										alt=""
										fill
										sizes="100vw"
										style={{ objectFit: 'cover' }}
									/>
								</div>
							)) : (
								<div className="slide-item" style={{ position: 'relative' }}>
									<Image
										src="/images/placeholder-property.svg"
										alt=""
										fill
										sizes="100vw"
										style={{ objectFit: 'cover' }}
										unoptimized
									/>
								</div>
							)}
							</div>
							<div className="gallery-dots">
								{Array.from({ length: images.length || 1 }).map((_, i) => (
									<span key={i} className={`dot ${mobileSlideIndex === i ? 'active' : ''}`} />
								))}
							</div>
						</div>

						{/* Title & Meta */}
						<section className="detail-title-section">
							<h1 className="detail-title">{property?.propertyTitle}</h1>
							<div className="detail-meta-row">
								<div className="meta-left">
									<div className="meta-item">
										<PlaceIcon className="meta-icon" />
										<span>{location || (property as any)?.city || '—'}</span>
									</div>
									<div className="meta-item meta-views">
										<RemoveRedEyeIcon sx={{ fontSize: 16 }} />
										<span>{(property?.propertyViews ?? 0).toLocaleString()} {t('Detail views')}</span>
									</div>
									<div className="meta-item meta-posted">
										<ScheduleIcon sx={{ fontSize: 16 }} />
										<span>{postedText}</span>
									</div>
									<div className="meta-item meta-id">ID: {property?._id?.slice(-5) ?? '—'}</div>
								</div>
								<div className="meta-actions">
									<button type="button" className="btn-share" onClick={shareHandler}>
										<ShareIcon sx={{ fontSize: 18 }} /> {t('Detail share')}
									</button>
									<button
										type="button"
										className={`btn-save ${isFavorited ? 'saved' : ''}`}
										onClick={() => !isFavorited && user && likePropertyHandler(user, property._id)}
									>
										{isFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
										{t('Save')}
									</button>
								</div>
							</div>
						</section>

						{/* Price & Specs Bar */}
						<section className="detail-price-specs">
							<div className="price-block">
								<div className="price-main">
									<span className="price-value">{formatUZSShort(property?.propertyPrice ?? 0)}</span>
									<span className="price-period">/oy</span>
								</div>
								{property?.propertyRent && <span className="price-note">+ kommunal to&apos;lovlar</span>}
								{(property as any)?.deposit && (
									<span className="price-deposit">Garov: {formatUZS((property as any).deposit)}</span>
								)}
							</div>
							<div className="specs-row">
								<div className="spec-item">
									<BedIcon className="spec-icon" />
									<span className="spec-value">{property?.propertyRooms ?? (property as any)?.rooms ?? 0}</span>
									<span className="spec-label">Xonalar</span>
								</div>
								<div className="spec-item">
									<BathtubIcon className="spec-icon" />
									<span className="spec-value">1</span>
									<span className="spec-label">Vannaxona</span>
								</div>
								<div className="spec-item">
									<SquareFootIcon className="spec-icon" />
									<span className="spec-value">{property?.propertySquare ?? 0}</span>
									<span className="spec-label">m²</span>
								</div>
								<div className="spec-item">
									<LayersIcon className="spec-icon" />
									<span className="spec-value">{(property as any)?.propertyFloor ?? '—'}</span>
									<span className="spec-label">Qavat</span>
								</div>
							</div>
						</section>

						{/* Description */}
						<section className="detail-description">
							<h2 className="section-heading">{t('Description')}</h2>
							<p className={`desc-text ${!descExpanded ? 'collapsed' : ''}`}>
								{property?.propertyDesc ?? t('No description available')}
							</p>
							<button
								type="button"
								className={`btn-show-more ${descExpanded ? 'expanded' : ''}`}
								onClick={() => setDescExpanded((e) => !e)}
							>
								{descExpanded ? t('Detail show less') : t('Detail show more')}
								<ExpandMoreIcon className="chevron" sx={{ fontSize: 20 }} />
							</button>
						</section>

						{/* Property Details Table */}
						<section className="detail-table">
							<h2 className="section-heading">{t('Detail about property')}</h2>
							<div className="detail-grid">
								{detailRows.map((row, i) => (
									<div key={i} className="detail-row">
										<span className="detail-label">{row.label}</span>
										<span className="detail-value">{row.value}</span>
									</div>
								))}
							</div>
						</section>

						{/* Map */}
						<section className="detail-map-section">
							<h2 className="section-heading">{t('Location')}</h2>
							<div className="map-container">
								<iframe
									src="https://yandex.uz/map-widget/v1/?ll=69.2401%2C41.2995&z=12&l=map"
									width="100%"
									height="320"
									frameBorder="0"
									allowFullScreen
								/>
							</div>
							<div className="map-address">
								<span>{fullAddress || '—'}</span>
								<button type="button" className="copy-btn" onClick={copyAddressHandler} aria-label="Copy">
									<ContentCopyIcon sx={{ fontSize: 18 }} />
								</button>
							</div>
						</section>

						<Box
							sx={{
								mt: 3,
								mb: 3,
								background: 'linear-gradient(135deg, #0a1628, #08091c)',
								border: '1px solid #1246E630',
								borderRadius: 3,
								p: 3,
							}}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<span style={{ fontSize: '1.1rem' }}>🤖</span>
									<Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#e2ddd6' }}>
										Asosiy ma&apos;lumot
									</Typography>
								</Box>
								<Box sx={{ display: 'flex', gap: 0.5 }}>
									{(['uz', 'ru'] as const).map((lang) => (
										<Box
											key={lang}
											onClick={() => setAiSummaryLang(lang)}
											sx={{
												fontSize: '0.7rem',
												fontWeight: 700,
												px: 1.2,
												py: 0.4,
												borderRadius: 99,
												cursor: 'pointer',
												background: aiSummaryLang === lang ? '#1246E6' : '#0f1020',
												color: aiSummaryLang === lang ? '#fff' : '#4b5563',
												textTransform: 'uppercase',
												transition: 'all 0.15s',
											}}
										>
											{lang}
										</Box>
									))}
								</Box>
							</Box>

							{!aiSummaryVisible ? (
								<Box
									onClick={() => setAiSummaryVisible(true)}
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 1,
										cursor: 'pointer',
										color: '#1246E6',
										fontSize: '0.85rem',
										fontWeight: 600,
										'&:hover': { opacity: 0.8 },
									}}
								>
									<span>✨</span>
									AI tahlilini ko&apos;rish
								</Box>
							) : aiSummaryLoading ? (
								<Typography sx={{ fontSize: '0.85rem', color: '#4b5563' }}>
									Tahlil tayyorlanmoqda...
								</Typography>
							) : aiSummary ? (
								<Typography sx={{ fontSize: '0.88rem', color: '#9ca3af', lineHeight: 1.7 }}>
									{aiSummaryLang === 'uz' ? aiSummary.uz : aiSummary.ru}
								</Typography>
							) : (
								<Typography sx={{ fontSize: '0.85rem', color: '#4b5563' }}>
									Ma&apos;lumot mavjud emas.
								</Typography>
							)}
						</Box>

						{/* Reviews */}
						{commentTotal > 0 && (
							<section className="detail-reviews">
								<h2 className="section-heading">{commentTotal} {t('Card reviews')}</h2>
								{propertyComments.map((c) => (
									<Review comment={c} key={c._id} />
								))}
								<Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
									<MuiPagination
										page={commentInquiry.page}
										count={Math.ceil(commentTotal / commentInquiry.limit) || 1}
										onChange={commentPaginationChangeHandler}
										shape="circular"
										color="primary"
									/>
								</Box>
							</section>
						)}

						{/* Leave Review */}
						<section className="detail-leave-review">
							<h2 className="section-heading">{t('Detail leave review')}</h2>
							<textarea
								value={insertCommentData.commentContent}
								onChange={(e) => setInsertCommentData((prev) => ({ ...prev, commentContent: e.target.value }))}
								placeholder={t('Detail review placeholder')}
							/>
							<Button
								className="submit-review-btn"
								disabled={!insertCommentData.commentContent || !user?._id}
								onClick={createCommantHandler}
							>
								{t('Detail submit review')}
							</Button>
						</section>

						{/* Similar Listings */}
						{destinationProperties.length > 0 && (
							<section className="detail-similar">
								<h2 className="section-heading">{t('Detail similar listings')}</h2>
								<div className="similar-scroll">
									{destinationProperties
										.filter((p) => p._id !== property._id)
										.slice(0, 6)
										.map((p) => (
											<div key={p._id} className="similar-card-wrap">
												<PropertyCard property={p} likePropertyHandler={likePropertyHandler} variant="compact" />
											</div>
										))}
								</div>
							</section>
						)}
					</div>

					{/* Sidebar Contact Card */}
					<aside className="detail-sidebar">
						<div className="contact-card">
							<div className="owner-block">
								<div className="owner-avatar">
									{property?.memberData?.memberImage ? (
										<img
											src={`${REACT_APP_API_URL}/${property.memberData.memberImage}`}
											alt=""
										/>
									) : (
										(property?.memberData?.memberNick || '?').slice(0, 2).toUpperCase()
									)}
								</div>
								<div className="owner-info">
									<Link href={`/member?memberId=${property?.memberData?._id}`} className="owner-name">
										{property?.memberData?.memberNick || t('Card owner default')}
									</Link>
									<span className="owner-role">
										{property?.memberData?.memberType === 'AGENT' ? 'Agent' : 'Mulkdor'}
									</span>
									<span className="owner-verified">✓ {t('Verified')}</span>
								</div>
							</div>
							<div className="response-stats">
								<span>⏱ {t('Detail response time')}</span>
								<span>📅 {t('Detail activity today')}</span>
							</div>
							<button type="button" className="btn-call" onClick={() => window.open(`tel:${memberPhone}`)}>
								<PhoneIcon /> {t('Detail call')}
							</button>
							<button type="button" className="btn-message">
								<ChatIcon /> {t('Send Message')}
							</button>
							{memberPhone && (
								<div className="phone-reveal">
									{phoneRevealed ? (
										<span className="phone-masked">{memberPhone}</span>
									) : (
										<>
											<span className="phone-masked">••• •• ••</span>
											<button type="button" className="reveal-link" onClick={() => setPhoneRevealed(true)}>
												{t('Detail reveal phone')}
											</button>
										</>
									)}
								</div>
							)}
							<div className="safety-note">
								<LockIcon sx={{ fontSize: 14 }} /> {t('Detail safe communication')}
							</div>
							{user?._id && (
								<button type="button" className="report-link" onClick={handleReportOpen}>
									<FlagOutlinedIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
									{t('Detail report listing')}
								</button>
							)}
						</div>
					</aside>
				</div>
			</div>

			{/* Mobile Sticky Bar */}
			<div className="detail-mobile-bar">
				<div className="mobile-price">
					{formatUZSShort(property?.propertyPrice ?? 0)}
					<span className="period">/oy</span>
				</div>
				<div className="mobile-actions">
					<button type="button" className="btn-mob btn-mob-outline">
						<ChatIcon /> {t('Detail message short')}
					</button>
					<button
						type="button"
						className="btn-mob btn-mob-primary"
						onClick={() => memberPhone && window.open(`tel:${memberPhone}`)}
					>
						<PhoneIcon /> {t('Detail call short')}
					</button>
				</div>
			</div>

			{/* Report Modal */}
			<Dialog
				open={reportOpen}
				onClose={() => setReportOpen(false)}
				maxWidth="xs"
				fullWidth
				PaperProps={{ sx: { borderRadius: '12px' } }}
			>
				<DialogTitle sx={{ fontWeight: 700, fontSize: 18, pb: 1 }}>
					Bu e&apos;lonni shikoyat qilish
				</DialogTitle>
				<DialogContent sx={{ pt: '8px !important' }}>
					<RadioGroup
						value={reportReason}
						onChange={(e) => setReportReason(e.target.value)}
					>
						{[
							{ value: 'FAKE', label: "Soxta e'lon" },
							{ value: 'WRONG_PRICE', label: "Narx noto'g'ri" },
							{ value: 'SPAM', label: 'Spam' },
							{ value: 'ALREADY_RENTED', label: 'Allaqachon ijaraga berilgan' },
							{ value: 'OTHER', label: 'Boshqa sabab' },
						].map((opt) => (
							<FormControlLabel
								key={opt.value}
								value={opt.value}
								control={<Radio size="small" />}
								label={opt.label}
								sx={{ '& .MuiFormControlLabel-label': { fontSize: 14 } }}
							/>
						))}
					</RadioGroup>
					<TextField
						multiline
						minRows={2}
						maxRows={4}
						fullWidth
						placeholder="Izoh (ixtiyoriy)"
						value={reportDesc}
						onChange={(e) => setReportDesc(e.target.value.slice(0, 500))}
						inputProps={{ maxLength: 500 }}
						sx={{ mt: 2 }}
						size="small"
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={() => setReportOpen(false)} sx={{ textTransform: 'none', color: '#6b7280' }}>
						Bekor qilish
					</Button>
					<Button
						variant="contained"
						color="error"
						disabled={!reportReason || reportLoading}
						onClick={handleReportSubmit}
						sx={{ textTransform: 'none', fontWeight: 600 }}
					>
						{reportLoading ? <CircularProgress size={18} color="inherit" /> : 'Yuborish'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Lightbox */}
			{lightboxOpen && images.length > 0 && (
				<div className="lightbox-overlay" onClick={(e) => e.target === e.currentTarget && closeLightbox()}>
					<button type="button" className="lightbox-close" onClick={closeLightbox} aria-label="Close">
						<CloseIcon />
					</button>
					<button type="button" className="lightbox-prev" onClick={lightboxPrev} aria-label="Previous">
						<ChevronLeftIcon />
					</button>
					<button type="button" className="lightbox-next" onClick={lightboxNext} aria-label="Next">
						<ChevronRightIcon />
					</button>
				<div className="lightbox-img-wrap" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
					<Image
						src={`${REACT_APP_API_URL}/${images[lightboxIndex]}`}
						alt=""
						fill
						sizes="100vw"
						style={{ objectFit: 'contain' }}
					/>
				</div>
					<div className="lightbox-counter">
						{lightboxIndex + 1} / {images.length}
					</div>
				</div>
			)}
		</div>
	);
};

PropertyDetail.defaultProps = {
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutFull(PropertyDetail);
