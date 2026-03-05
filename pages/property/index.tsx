// Phase 4 Task 7 — Filter Bar Redesign
// Phase 4 Task 8
import React, { ChangeEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import { NextPage } from 'next';
import { Drawer, Pagination, Stack, Typography } from '@mui/material';
import PropertyCard from '../../libs/components/property/PropertyCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import FilterBar from '../../libs/components/property/FilterBar';
import { useRouter } from 'next/router';
import { PropertiesInquiry } from '../../libs/types/property/property.input';
import { Property } from '../../libs/types/property/property';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [properties, setProperties] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

	useEffect(() => {
		const q = router.query;
		if (!Object.keys(q).length) return;

		const aiFilters: any = {};

		if (q.districts) aiFilters.locationList = String(q.districts).split(',');
		if (q.listingType) aiFilters.listingTypeList = [String(q.listingType)];
		if (q.propertyType) aiFilters.typeList = [String(q.propertyType)];
		if (q.priceMin || q.priceMax) {
			aiFilters.pricesRange = {
				start: q.priceMin ? Number(q.priceMin) : 0,
				end: q.priceMax ? Number(q.priceMax) : 9_999_999_999,
			};
		}
		if (q.rooms) aiFilters.roomsList = String(q.rooms)
			.split(',')
			.map((v) => Number(v));
		if (q.text) aiFilters.text = String(q.text);

		if (Object.keys(aiFilters).length) {
			setSearchFilter((prev: any) => ({
				...prev,
				page: 1,
				search: {
					...prev.search,
					...aiFilters,
				},
			}));
		}
	}, [router.query]);

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProperties(data.getProperties.list);
			setTotal(data.getProperties.metaCounter[0].total);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const inputObj = JSON.parse(router?.query?.input as string);
			setSearchFilter(inputObj);
		}
		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	useEffect(() => {
		if (searchFilter) {
			getPropertiesRefetch({ input: searchFilter });
		}
	}, [searchFilter]);

	/** HANDLERS **/
	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetProperty({ variables: { input: id } });
			await getPropertiesRefetch({ input: initialInput });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(
			`/property?input=${JSON.stringify(searchFilter)}`,
			`/property?input=${JSON.stringify(searchFilter)}`,
			{ scroll: false },
		);
		setCurrentPage(value);
	};

	const activeFilterCount =
		(searchFilter?.search?.locationList?.length ?? 0) +
		(searchFilter?.search?.typeList?.length ?? 0) +
		(searchFilter?.search?.roomsList?.length ?? 0);

	// ── Mobile render ─────────────────────────────────────────────────────────
	if (device === 'mobile') {
		return (
			<div id="property-list-page" className="property-list-mobile">
				<div className="property-mobile-container">
					<Stack className="property-mobile-list property-card-grid">
						{getPropertiesLoading ? (
							[1, 2, 3, 4].map((i) => <PropertyCard key={i} isLoading />)
						) : properties?.length === 0 ? (
							<div className="no-data">
								<Image src="/img/icons/icoAlert.svg" alt="" width={80} height={80} unoptimized />
								<p>{t('No results found')}</p>
							</div>
						) : (
							properties.map((p: Property) => (
								<PropertyCard property={p} likePropertyHandler={likePropertyHandler} key={p._id} />
							))
						)}
					</Stack>

					{properties.length > 0 && (
						<Stack className="property-mobile-pagination">
							<Pagination
								page={currentPage}
								count={Math.ceil(total / searchFilter.limit)}
								onChange={handlePaginationChange}
								shape="circular"
								color="primary"
								showFirstButton={false}
								showLastButton={false}
								siblingCount={1}
							/>
							<Typography className="property-mobile-total">
								{total} {t('Properties')}
							</Typography>
						</Stack>
					)}
				</div>

				{/* Floating "Filtrlar" button */}
				<button
					type="button"
					className="property-mobile-filter-btn"
					onClick={() => setFilterDrawerOpen(true)}
					aria-label={t('Filtrlar')}
				>
					<FilterListIcon />
					<span>{t('Filtrlar')}</span>
					{activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
				</button>

				{/* Mobile filter bottom sheet */}
				<Drawer
					anchor="bottom"
					open={filterDrawerOpen}
					onClose={() => setFilterDrawerOpen(false)}
					PaperProps={{
						className: 'property-filter-drawer',
						sx: {
							borderRadius: '28px 28px 0 0',
							maxHeight: '92vh',
							paddingTop: 2,
						},
					}}
				>
					<div className="filter-drawer-handle" />
					<div className="filter-drawer-content">
						<FilterBar
							searchFilter={searchFilter}
							setSearchFilter={setSearchFilter}
							initialInput={initialInput}
							total={total}
							isMobile
							onClose={() => setFilterDrawerOpen(false)}
						/>
					</div>
				</Drawer>
			</div>
		);
	}

	// ── Desktop render ────────────────────────────────────────────────────────
	return (
		<div id="property-list-page">
			{/* Sticky horizontal filter bar + results header */}
			<FilterBar
				searchFilter={searchFilter}
				setSearchFilter={setSearchFilter}
				initialInput={initialInput}
				total={total}
				viewMode={viewMode}
				onViewChange={setViewMode}
			/>

			{/* Results grid */}
			<div className="property-page-new">
				<div className={`list-config property-card-grid${viewMode === 'list' ? ' list-view' : ''}`}>
					{getPropertiesLoading ? (
						[1, 2, 3, 4, 5, 6].map((i) => <PropertyCard key={i} isLoading />)
					) : properties?.length === 0 ? (
						<div className="no-data">
							<Image src="/img/icons/icoAlert.svg" alt="" width={80} height={80} unoptimized />
							<p>No Properties found!</p>
						</div>
					) : (
						properties.map((property: Property) => (
							<PropertyCard
								property={property}
								likePropertyHandler={likePropertyHandler}
								key={property?._id}
							/>
						))
					)}
				</div>

				<div className="pagination-config">
					{properties.length !== 0 && (
						<div className="pagination-box">
							<Pagination
								page={currentPage}
								count={Math.ceil(total / searchFilter.limit)}
								onChange={handlePaginationChange}
								shape="circular"
								color="primary"
							/>
						</div>
					)}
					{properties.length !== 0 && (
						<div className="total-result">
							<p>
								Jami {total} ta ko'chmas mulk mavjud
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

PropertyList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {
			squaresRange: {
				start: 0,
				end: 500,
			},
			pricesRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};

export default withLayoutBasic(PropertyList);
