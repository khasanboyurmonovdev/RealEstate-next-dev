import React, { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import Image from 'next/image';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	Box,
	Button,
	CircularProgress,
	Divider,
	List,
	ListItem,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_PROPERTIES_BY_ADMIN } from '../../../apollo/admin/query';
import {
	VERIFY_PROPERTY_BY_ADMIN,
	REJECT_PROPERTY_BY_ADMIN,
} from '../../../apollo/admin/mutation';
import { Property } from '../../../libs/types/property/property';
import { AllPropertiesInquiry } from '../../../libs/types/property/property.input';
import { PropertyVerificationStatus } from '../../../libs/enums/property.enum';
import { REACT_APP_API_URL } from '../../../libs/config';
import { formatUZS } from '../../../libs/utils';
import { sweetConfirmAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import { T } from '../../../libs/types/common';

type VerificationTab = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

const TAB_CONFIG: { key: VerificationTab; label: string }[] = [
	{ key: 'PENDING', label: 'Kutilmoqda' },
	{ key: 'UNDER_REVIEW', label: "Ko'rib chiqilmoqda" },
	{ key: 'VERIFIED', label: 'Tasdiqlangan' },
	{ key: 'REJECTED', label: 'Rad etilgan' },
];

const AdminVerification: NextPage = ({ initialInquiry, ...props }: any) => {
	const [activeTab, setActiveTab] = useState<VerificationTab>('PENDING');
	const [inquiry, setInquiry] = useState<AllPropertiesInquiry>(initialInquiry);
	const [properties, setProperties] = useState<Property[]>([]);
	const [total, setTotal] = useState(0);
	const [rejectingId, setRejectingId] = useState<string | null>(null);
	const [rejectReason, setRejectReason] = useState('');

	const [verifyProperty, { loading: verifying }] = useMutation(VERIFY_PROPERTY_BY_ADMIN);
	const [rejectProperty, { loading: rejecting }] = useMutation(REJECT_PROPERTY_BY_ADMIN);

	const { loading, refetch } = useQuery(GET_ALL_PROPERTIES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProperties(data?.getAllPropertiesByAdmin?.list ?? []);
			setTotal(data?.getAllPropertiesByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		setInquiry((prev) => ({
			...prev,
			page: 1,
			search: { verificationStatus: activeTab as PropertyVerificationStatus },
		}));
	}, [activeTab]);

	useEffect(() => {
		refetch({ input: inquiry });
	}, [inquiry]);

	const changePageHandler = useCallback((_: unknown, newPage: number) => {
		setInquiry((prev) => ({ ...prev, page: newPage + 1 }));
	}, []);

	const changeRowsPerPageHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setInquiry((prev) => ({ ...prev, limit: parseInt(e.target.value, 10), page: 1 }));
	}, []);

	const handleVerify = useCallback(
		async (id: string) => {
			try {
				if (await sweetConfirmAlert('Ushbu mulkni tasdiqlaysizmi?')) {
					await verifyProperty({ variables: { input: id } });
					await sweetTopSmallSuccessAlert('Tasdiqlandi!');
					await refetch({ input: inquiry });
				}
			} catch (err: any) {
				sweetErrorHandling(err);
			}
		},
		[verifyProperty, refetch, inquiry],
	);

	const handleRejectSubmit = useCallback(
		async (id: string) => {
			if (!rejectReason.trim()) return;
			try {
				await rejectProperty({
					variables: { input: { propertyId: id, rejectionReason: rejectReason.trim() } },
				});
				await sweetTopSmallSuccessAlert('Rad etildi');
				setRejectingId(null);
				setRejectReason('');
				await refetch({ input: inquiry });
			} catch (err: any) {
				sweetErrorHandling(err);
			}
		},
		[rejectProperty, rejectReason, refetch, inquiry],
	);

	const formatDate = (d?: Date | string) => {
		if (!d) return '—';
		const date = new Date(d);
		return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
	};

	const showActions = activeTab === 'PENDING' || activeTab === 'UNDER_REVIEW';

	return (
		<Box component="div" className="content">
			<Typography variant="h2" className="tit" sx={{ mb: '24px' }}>
				Verification Queue
			</Typography>
			<Box component="div" className="table-wrap">
				<Box component="div" sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={activeTab}>
						<Box component="div">
							<List className="tab-menu">
								{TAB_CONFIG.map((tab) => (
									<ListItem
										key={tab.key}
										onClick={() => setActiveTab(tab.key)}
										className={activeTab === tab.key ? 'li on' : 'li'}
										sx={{ gap: 1 }}
									>
										{tab.label}
										{activeTab === tab.key && total > 0 && (
											<Box
												component="span"
												sx={{
													ml: 0.5,
													px: 1,
													py: 0.25,
													fontSize: 11,
													fontWeight: 700,
													borderRadius: '10px',
													bgcolor: activeTab === 'PENDING' ? '#FF6B2B' : '#6b7280',
													color: '#fff',
													lineHeight: 1.6,
												}}
											>
												{total}
											</Box>
										)}
									</ListItem>
								))}
							</List>
							<Divider />
						</Box>

						{loading ? (
							<Stack alignItems="center" py={6}>
								<CircularProgress />
							</Stack>
						) : properties.length === 0 ? (
							<Stack alignItems="center" py={6}>
								<Typography color="text.secondary">Ma'lumot topilmadi</Typography>
							</Stack>
						) : (
							<Stack spacing={0}>
								{properties.map((property) => {
									const img = property.propertyImages?.[0]
										? `${REACT_APP_API_URL}/${property.propertyImages[0]}`
										: (property as any)?.images?.[0]
											? `${REACT_APP_API_URL}/${(property as any).images[0]}`
											: null;

									return (
										<Box key={property._id}>
											<Stack
												direction="row"
												alignItems="center"
												spacing={2}
												sx={{ px: 3, py: 2 }}
											>
												{/* Thumbnail */}
												<Box
													sx={{
														width: 60,
														height: 60,
														borderRadius: '8px',
														overflow: 'hidden',
														flexShrink: 0,
														position: 'relative',
														bgcolor: '#f3f4f6',
													}}
												>
													{img ? (
														<Image
															src={img}
															alt={property.propertyTitle || ''}
															fill
															sizes="60px"
															style={{ objectFit: 'cover' }}
														/>
													) : (
														<Box
															sx={{
																width: '100%',
																height: '100%',
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
																color: '#9ca3af',
																fontSize: 11,
															}}
														>
															Rasm yo'q
														</Box>
													)}
												</Box>

												{/* Info */}
												<Stack flex={1} minWidth={0}>
													<Typography
														variant="subtitle2"
														noWrap
														sx={{ fontWeight: 600 }}
													>
														{property.propertyTitle || 'Nomsiz'}
													</Typography>
													<Typography variant="caption" color="text.secondary" noWrap>
														{property.propertyAddress || '—'} &middot;{' '}
														{formatUZS(property.propertyPrice)}
													</Typography>
													<Typography variant="caption" color="text.secondary">
														{formatDate(property.createdAt)}
														{property.rejectionReason && (
															<>
																{' '}&middot;{' '}
																<Box component="span" sx={{ color: 'error.main' }}>
																	Sabab: {property.rejectionReason}
																</Box>
															</>
														)}
													</Typography>
												</Stack>

												{/* Action buttons */}
												{showActions && (
													<Stack direction="row" spacing={1} flexShrink={0}>
														{rejectingId === property._id ? (
															<Stack direction="row" spacing={1} alignItems="center">
																<TextField
																	size="small"
																	placeholder="Rad etish sababi..."
																	value={rejectReason}
																	onChange={(e) => setRejectReason(e.target.value)}
																	onKeyDown={(e) => {
																		if (e.key === 'Enter') handleRejectSubmit(property._id);
																	}}
																	sx={{ width: 220 }}
																	autoFocus
																/>
																<Button
																	size="small"
																	variant="contained"
																	color="error"
																	disabled={!rejectReason.trim() || rejecting}
																	onClick={() => handleRejectSubmit(property._id)}
																>
																	{rejecting ? <CircularProgress size={16} /> : 'Yuborish'}
																</Button>
																<Button
																	size="small"
																	onClick={() => {
																		setRejectingId(null);
																		setRejectReason('');
																	}}
																>
																	Bekor
																</Button>
															</Stack>
														) : (
															<>
																<Button
																	size="small"
																	variant="contained"
																	color="success"
																	startIcon={<CheckCircleOutlineIcon />}
																	disabled={verifying}
																	onClick={() => handleVerify(property._id)}
																	sx={{ textTransform: 'none', fontWeight: 600 }}
																>
																	Tasdiqlash
																</Button>
																<Button
																	size="small"
																	variant="outlined"
																	color="error"
																	startIcon={<CancelOutlinedIcon />}
																	onClick={() => {
																		setRejectingId(property._id);
																		setRejectReason('');
																	}}
																	sx={{ textTransform: 'none', fontWeight: 600 }}
																>
																	Rad etish
																</Button>
															</>
														)}
													</Stack>
												)}
											</Stack>
											<Divider />
										</Box>
									);
								})}
							</Stack>
						)}

						<TablePagination
							rowsPerPageOptions={[10, 20, 40]}
							component="div"
							count={total}
							rowsPerPage={inquiry.limit}
							page={inquiry.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

AdminVerification.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			verificationStatus: 'PENDING',
		},
	},
};

export default withAdminLayout(AdminVerification);
