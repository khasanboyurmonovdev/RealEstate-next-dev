import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberProperties
			memberRank
			memberArticles
			memberPoints
			memberLikes
			memberViews
			memberWarnings
			memberBlocks
			deletedAt
			createdAt
			updatedAt
			accessToken
		}
	}
`;

/**************************
 *        PROPERTY        *
 *************************/

export const UPDATE_PROPERTY_BY_ADMIN = gql`
	mutation UpdatePropertyByAdmin($input: PropertyUpdate!) {
		updatePropertyByAdmin(input: $input) {
			_id
			propertyTitle
			propertyPrice
			propertyDesc
			propertySquare
			propertyRent
			propertyBarter
			city
			district
			images
			propertyStatus
			verificationStatus
			soldAt
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_PROPERTY_BY_ADMIN = gql`
	mutation RemovePropertyByAdmin($input: ID!) {
		removePropertyByAdmin(propertyId: $input) {
			_id
			propertyTitle
			propertyPrice
			propertyDesc
			propertySquare
			propertyRent
			propertyBarter
			city
			district
			images
			owner
			propertyStatus
			verificationStatus
			propertyViews
			propertyLikes
			propertyRank
			soldAt
			deletedAt
			createdAt
			updatedAt
		}
	}
`;

export const VERIFY_PROPERTY_BY_ADMIN = gql`
	mutation VerifyPropertyByAdmin($input: ID!) {
		verifyPropertyByAdmin(propertyId: $input) {
			_id
			propertyTitle
			propertyStatus
			verificationStatus
			updatedAt
		}
	}
`;

export const REJECT_PROPERTY_BY_ADMIN = gql`
	mutation RejectPropertyByAdmin($input: RejectPropertyInput!) {
		rejectPropertyByAdmin(input: $input) {
			_id
			propertyTitle
			propertyStatus
			verificationStatus
			rejectionReason
			updatedAt
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			memberId
			createdAt
			updatedAt
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
			_id
			commentStatus
			commentGroup
			commentContent
			commentRefId
			memberId
			createdAt
			updatedAt
		}
	}
`;
