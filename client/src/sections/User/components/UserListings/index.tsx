import React from "react";
import { Typography, List } from "antd";
import { User } from "../../../../lib/graphql/queries/User/__generated__/User";
import { ListingCard } from "../../../../lib/components";

interface Props {
  userListings: User["user"]["listings"];
  listingsPage: number;
  limit: number;
  setListingsPage: (page: number) => void;
}

const { Paragraph, Title } = Typography;

export const UserListings = ({
  userListings,
  listingsPage,
  limit,
  setListingsPage
}: Props) => {
  const { result, total } = userListings;
  const userListingsList = (
    <List
      grid={{
        gutter: 8,
        xs: 1,
        sm: 2,
        lg: 4
      }}
      dataSource={result}
      locale={{ emptyText: "User doesn't have any listings yet!" }}
      pagination={{
        position: "top",
        current: listingsPage,
        total,
        defaultPageSize: limit,
        hideOnSinglePage: true,
        showLessItems: true,
        onChange: (page: number) => setListingsPage(page)
      }}
      renderItem={item => (
        <List.Item>
          <ListingCard listing={item} />
        </List.Item>
      )}
    />
  );

  return (
    <div className="user-listings">
      <Title level={4} className="user-listings__title">
        Listings
      </Title>
      <Paragraph className="user-listings__description">
        This section highlights the listings this user currently hosts and has
        made available for bookings.
      </Paragraph>
      {userListingsList}
    </div>
  );
};
