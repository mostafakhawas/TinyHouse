import React from "react";
import { Link } from "react-router-dom";
import { Typography, List, Divider, Avatar } from "antd";
import { Listing as ListingData } from "../../../../lib/graphql/queries/Listing/__generated__/Listing";

interface Props {
  listingBookings: ListingData["listing"]["bookings"];
  bookingsPage: number;
  limit: number;
  setBookingsPage: (page: number) => void;
}

const { Title, Text } = Typography;

export const ListingBookings = ({
  listingBookings,
  bookingsPage,
  limit,
  setBookingsPage
}: Props) => {
  const total = listingBookings ? listingBookings.total : null;
  const result = listingBookings ? listingBookings.result : null;

  const listingBookingsList = listingBookings ? (
    <List
      grid={{
        gutter: 8,
        xs: 1,
        sm: 2,
        lg: 3
      }}
      dataSource={result ? result : undefined}
      locale={{ emptyText: "No bookings have been made yet!" }}
      pagination={{
        current: bookingsPage,
        total: total ? total : undefined,
        defaultPageSize: limit,
        hideOnSinglePage: true,
        showLessItems: true,
        onChange: (page: number) => setBookingsPage(page)
      }}
      renderItem={item => {
        const bookingHistory = (
          <div className="listing-bookings__bookings-history">
            <div>
              Check in: <Text strong>{item.checkIn}</Text>
            </div>
            <div>
              Check out: <Text strong>{item.checkOut}</Text>
            </div>
          </div>
        );
        return (
          <List.Item className="listing-bookings__item">
            {bookingHistory}
            <Link to={`/user/${item.tenant.id}`}>
              <Avatar src={item.tenant.avatar} size={64} />
            </Link>
          </List.Item>
        );
      }}
    />
  ) : null;

  const listingBookingsElemet = listingBookingsList ? (
    <div className="listing-bookings">
      <Divider />
      <div className="listing-bookings__section">
        <Title className="listing-bookings__title" level={4}>
          Booking
        </Title>
      </div>
      {listingBookingsList}
    </div>
  ) : null;

  return listingBookingsElemet;
};
