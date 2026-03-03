// Phase 4 Task 6 — Mobile polish
// Phase 4 Task 8 — next/image migration
import React, { useState } from 'react';
import Image from 'next/image';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import PropertyCard from '../property/PropertyCard';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { Messages } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';

const MyFavorites: NextPage = () => {
	const device = useDeviceDetect();
	const [myFavorites, setMyFavorites] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFavorites, setSearchFavorites] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const {
		loading: getFavoritesLoading,
		data: getFavoritesData,
		error: getFavoritesError,
		refetch: getFavoritesRefetch,
	} = useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFavorites },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMyFavorites(data.getFavorites?.list);
			setTotal(data.getFavorites?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFavorites({ ...searchFavorites, page: value });
	};

	const likePropertyHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetProperty({
				variables: {
					input: id,
				},
			});
			await getFavoritesRefetch({ input: searchFavorites });
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return (
			<div id="my-favorites-page" className="my-favorites-mobile">
				<Stack className="main-title-box">
					<Typography className="main-title">My Favorites</Typography>
					<Typography className="sub-title">Homes you love, saved for later.</Typography>
				</Stack>
				<Stack className="favorites-list-box">
					{myFavorites?.length ? (
						myFavorites.map((property: Property) => (
							<PropertyCard
								likePropertyHandler={likePropertyHandler}
								key={property._id}
								property={property}
								myFavorites
							/>
						))
					) : (
						<div className="no-data">
							<Image src="/img/icons/icoAlert.svg" alt="" width={56} height={56} unoptimized style={{ maxWidth: 280, margin: '0 auto' }} />
							<p>No Favorites found!</p>
						</div>
					)}
				</Stack>
				{myFavorites?.length ? (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchFavorites.limit)}
								page={searchFavorites.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
								showFirstButton={false}
								showLastButton={false}
								siblingCount={1}
							/>
						</Stack>
					</Stack>
				) : null}
			</div>
		);
	} else {
		return (
			<div id="my-favorites-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Favorites</Typography>
						<Typography className="sub-title">Homes you love, saved for later.</Typography>
					</Stack>
				</Stack>
				<Stack className="favorites-list-box">
					{myFavorites?.length ? (
						myFavorites?.map((property: Property) => {
							return (
								<PropertyCard
									likePropertyHandler={likePropertyHandler}
									key={property._id}
									property={property}
									myFavorites={true}
								/>
							);
						})
					) : (
						<div className={'no-data'}>
							<Image src="/img/icons/icoAlert.svg" alt="" width={56} height={56} unoptimized />
							<p>No Favorites found!</p>
						</div>
					)}
				</Stack>
				{myFavorites?.length ? (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchFavorites.limit)}
								page={searchFavorites.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>
								Total {total} favorite propert{total > 1 ? 'ies' : 'y'}
							</Typography>
						</Stack>
					</Stack>
				) : null}
			</div>
		);
	}
};

export default MyFavorites;
