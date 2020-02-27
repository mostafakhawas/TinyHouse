import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { useParams } from "react-router-dom";
import { Layout, Row, Col } from "antd";
import { Moment } from "moment";
import { LISTING } from "../../lib/graphql";
import { PageSkeleton, ErrorBanner } from "../../lib/components";
import {
  Listing as ListingData,
  ListingVariables
} from "../../lib/graphql/queries/Listing/__generated__/Listing";
import {
  ListingDetails,
  ListingBookings,
  ListingCreateBooking,
  WrappedListingCreateBookingModal
} from "./components";
import { Viewer } from "../../lib/types";
import { useScrollToTop } from "../../lib/hooks";

interface MatchProps {
  id: string;
}

interface Props {
  viewer: Viewer;
}

const PAGE_LIMIT = 3;
const { Content } = Layout;

export const Listing = ({ viewer }: Props) => {
  const [bookingsPage, setBookingsPage] = useState(1);
  const [checkInDate, setCheckInDate] = useState<Moment | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Moment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { id } = useParams<MatchProps>();

  const { data, error, loading, refetch } = useQuery<
    ListingData,
    ListingVariables
  >(LISTING, {
    variables: {
      id,
      limit: PAGE_LIMIT,
      bookingsPage
    }
  });

  useScrollToTop();

  const clearBookingData = () => {
    setModalVisible(false);
    setCheckInDate(null);
    setCheckOutDate(null);
  };

  const handleListingRefetch = async () => {
    await refetch();
  };

  if (loading) {
    return (
      <Content className="listings">
        <PageSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="listings">
        <ErrorBanner description="This listing may not exist or we 've encounted an error. Please try again soon." />
        <PageSkeleton />
      </Content>
    );
  }

  const listing = data ? data.listing : null;
  const listingBookings = listing ? listing.bookings : null;

  const listingDetailsElement = listing ? (
    <ListingDetails listing={listing} />
  ) : null;

  const listingBookingsElement = listingBookings ? (
    <ListingBookings
      listingBookings={listingBookings}
      bookingsPage={bookingsPage}
      setBookingsPage={setBookingsPage}
      limit={PAGE_LIMIT}
    />
  ) : null;

  const listingCreateBookingElement = listing ? (
    <ListingCreateBooking
      price={listing.price}
      checkInDate={checkInDate}
      checkOutDate={checkOutDate}
      setCheckInDate={setCheckInDate}
      setCheckOutDate={setCheckOutDate}
      viewer={viewer}
      host={listing.host}
      bookingsIndex={listing.bookingsIndex}
      setModalVisible={setModalVisible}
    />
  ) : null;

  const listingCreateBookingModalElement =
    listing && checkInDate && checkOutDate ? (
      <WrappedListingCreateBookingModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        price={listing.price}
        id={listing.id}
        clearBookingData={clearBookingData}
        handleListingRefetch={handleListingRefetch}
      />
    ) : null;

  return (
    <Content className="listings">
      <Row gutter={24} type="flex" justify="space-between">
        <Col xs={24} lg={14}>
          {listingDetailsElement}
          {listingBookingsElement}
        </Col>
        <Col xs={24} lg={10}>
          {listingCreateBookingElement}
        </Col>
      </Row>
      {listingCreateBookingModalElement}
    </Content>
  );
};
