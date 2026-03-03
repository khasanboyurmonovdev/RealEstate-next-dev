// Phase 4 Task 4
import React from 'react';
import PropertyCard from '../property/PropertyCard';
import { Property } from '../../types/property/property';

interface TrendPropertyCardProps {
	property: Property;
	likePropertyHandler: any;
}

const TrendPropertyCard = (props: TrendPropertyCardProps) => {
	return <PropertyCard {...props} variant="default" />;
};

export default TrendPropertyCard;
