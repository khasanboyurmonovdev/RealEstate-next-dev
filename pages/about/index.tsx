import React from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box } from '@mui/material';

const About: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return <div>ABOUT PAGE MOBILE</div>;
	} else {
		return (
			<Stack className={'about-page'}>
				<Stack className={'intro'}>
					<Stack className={'container'}>
						<Stack className={'left'}>
							<strong>Your property journey begins here. Welcome to PropNation. </strong>
						</Stack>
						<Stack className={'right'}>
							<p>
								At PropNation, we believe that finding the right home should be simple, reliable, and empowering.
								Whether you're searching for a cozy apartment, a luxurious villa, or a family-friendly house, our
								platform connects you to the best properties across the United States.
								<br />
								<br />
								Founded with the vision of redefining the real estate experience, PropNation combines cutting-edge
								technology with a human-centered approach. We’re committed to transparency, trust, and delivering value
								to both buyers and sellers. Our growing database features listings from top cities and hidden gems
								alike, helping people discover places they can truly call home. With intuitive search tools, verified
								listings, and dedicated support, we’re here to make your journey smooth—from browsing to closing.
							</p>
							<Stack className={'boxes'}>
								<div className={'box'}>
									<div>
										<img src="/img/icons/garden.svg" alt="" />
									</div>
									<span>Next-Gen Villas</span>
									<p>Future-ready homes with innovative features and timeless design.</p>
								</div>
								<div className={'box'}>
									<div>
										<img src="/img/icons/securePayment.svg" alt="" />
									</div>
									<span>Safe & Easy Transactions </span>
									<p>Your payments are protected with industry-standard encryption and fast processing.</p>
								</div>
							</Stack>
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'statistics'}>
					<Stack className={'container'}>
						<Stack className={'banner'}>
							<img src="/img/banner/Header1.jpg" alt="" />
						</Stack>
						<Stack className={'info'}>
							<Box component={'div'}>
								<strong> 4M+</strong>
								<p>A growing community that believes in our platform.</p>
							</Box>
							<Box component={'div'}>
								<strong>12K </strong>
								<p>Each property is reviewed, approved, and ready.</p>
							</Box>
							<Box component={'div'}>
								<strong>20M</strong>
								<p>A trusted platform with a happy client base.</p>
							</Box>
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'agents'}>
					<Stack className={'container'}>
						<span className={'title'}>Agents You Can Count On</span>
						<p className={'desc'}>Verified, experienced, and dedicated to your success.</p>
						<Stack className={'wrap'}>
							{/*{[1, 2, 3, 4, 5].map(() =>*/} {}
							{/*	return <AgentCard />;*/}
							{/*})}*/}
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'options'}>
					<img src="/img/banner/Aboutbanner.jpg" alt="" className={'about-banner'} />
					<Stack className={'container'}>
						<strong>Helping You Make the Right Move</strong>
						<Stack>
							<div className={'icon-box'}>
								<img src="/img/icons/security.svg" alt="" />
							</div>
							<div className={'text-box'}>
								<span>Full-Scale Protection</span>
								<p>Your data, deals, and peace of mind are always safeguarded.</p>
							</div>
						</Stack>
						<Stack>
							<div className={'icon-box'}>
								<img src="/img/icons/keywording.svg" alt="" />
							</div>
							<div className={'text_-box'}>
								<span>Targeted Search Power</span>
								<p>Stand out with precision keywords that boost discoverability.</p>
							</div>
						</Stack>
						<Stack>
							<div className={'icon-box'}>
								<img src="/img/icons/investment.svg" alt="" />
							</div>
							<div className={'text-box'}>
								<span>Value That Lasts</span>
								<p>From rental income to resale, we help you invest wisely</p>
							</div>
						</Stack>
						<Stack className={'btn'}>
							Learn More
							<img src="/img/icons/rightup.svg" alt="" />
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'partners'}>
					<Stack className={'container'}>
						<span>Trusted bu the world's best</span>
						<Stack className={'wrap'}>
							<img src="/img/icons/brands/amazon.svg" alt="" />
							<img src="/img/icons/brands/amd.svg" alt="" />
							<img src="/img/icons/brands/cisco.svg" alt="" />
							<img src="/img/icons/brands/dropcam.svg" alt="" />
							<img src="/img/icons/brands/spotify.svg" alt="" />
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'help'}>
					<Stack className={'container'}>
						<Box component={'div'} className={'left'}>
							<strong>Have Questions? We’ve Got You Covered.</strong>
							<p>Speak to a specialist or discover more properties.</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'white'}>
								Connect with Us
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
							<div className={'black'}>
								<img src="/img/icons/call.svg" alt="" />
								+821073751408
							</div>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(About);
