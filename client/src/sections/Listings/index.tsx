import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@apollo/react-hooks";
import { useParams, Link } from "react-router-dom";
import { Layout, List, Typography, Affix } from "antd";
import { ListingCard, ErrorBanner } from "../../lib/components";
import {
  Listings as ListingsData,
  ListingsVariables
} from "../../lib/graphql/queries/Listings/__generated__/Listings";
import { LISTINGS } from "../../lib/graphql";
import { ListingsFilter } from "../../lib/graphql/globalTypes";
import {
  ListingsFilters,
  ListingsPagination,
  ListingsSkeleton
} from "./components";
import { useScrollToTop } from "../../lib/hooks";

interface MatchParams {
  location: string;
}

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const PAGE_LIMIT = 8;

export const Listings = () => {
  const { location } = useParams<MatchParams>();
  const locationRef = useRef(location);
  const [filter, setFilter] = useState<ListingsFilter>(
    ListingsFilter.PRICE_LOW_TO_HIGH
  );
  const [page, setPage] = useState(1);

  const { loading, data, error } = useQuery<ListingsData, ListingsVariables>(
    LISTINGS,
    {
      variables: {
        location,
        filter,
        limit: PAGE_LIMIT,
        page
      },
      skip: locationRef.current !== location && page !== 1 // check lesson 57
    }
  );

  useScrollToTop();

  useEffect(() => {
    setPage(1);
    locationRef.current = location;
  }, [location]);

  if (loading) {
    return (
      <Content className="listings">
        <ListingsSkeleton />
      </Content>
    );
  }

  if (error) {
    return (
      <Content className="listings">
        <ErrorBanner description="We either couldn't find anything matching your search or we've encountered an error. If you're searching for a unique location, try searching again with more common keywords." />
        <ListingsSkeleton />
      </Content>
    );
  }

  const listings = data ? data.listings : null;
  const listingsRegion = listings ? listings.region : null;

  const listingsSectionElement =
    listings && listings.result.length > 0 ? (
      <div>
        <Affix offsetTop={64}>
          <>
            <ListingsPagination
              limit={PAGE_LIMIT}
              total={listings.total}
              page={page}
              setPage={setPage}
            />
            <ListingsFilters filter={filter} setFilter={setFilter} />
          </>
        </Affix>

        <List
          grid={{
            gutter: 8,
            lg: 4,
            sm: 2,
            xs: 1
          }}
          dataSource={listings.result}
          renderItem={item => (
            <List.Item>
              <ListingCard listing={item} />
            </List.Item>
          )}
        />
      </div>
    ) : (
      <div>
        <Paragraph>
          It appears that no listings have been created for{" "}
          <Text mark>{listingsRegion}</Text>
        </Paragraph>
        <Paragraph>
          Be the first person to create a{" "}
          <Link to="/host">listing in this area!</Link>
        </Paragraph>
      </div>
    );

  const listingsRegionElement = listingsRegion ? (
    <Title level={3} className="listings__title">
      Results for "{listingsRegion}"
    </Title>
  ) : null;

  return (
    <Content className="listings">
      {listingsRegionElement}
      {listingsSectionElement}
    </Content>
  );
};
