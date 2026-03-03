// Phase 4 Task 8 — next/image migration
import React from 'react';
import Image from 'next/image';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const Article = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return <div>PROPERTY CARD</div>;
	} else {
		return (
			<Stack className="card-config">
				<Stack className="top">
					<Image src="/img/apartmentMain.png" alt="" width={400} height={280} style={{ objectFit: 'cover', width: '100%' }} />
					<Box component={'div'} className={'date'}>
						<Typography>July 28</Typography>
					</Box>
				</Stack>
				<Stack className="bottom">
					<Stack className="name-address">
						<Stack className="name">
							<Typography>Equestrian Family Home</Typography>
						</Stack>
						<Stack className="address">
							<Typography>Chilonzor, Tashkent</Typography>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Article;
