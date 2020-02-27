import React from "react";
import { Skeleton, List, Card } from "antd";
import listingsLoadingCardCover from "../../assets/listing-loading-card-cover.jpg";

export const ListingsSkeleton = () => {
  const emptyData = [{}, {}, {}, {}, {}, {}, {}, {}];
  return (
    <div>
      <Skeleton paragraph={{ rows: 1 }} />
      <List
        grid={{
          gutter: 8,
          xs: 1,
          sm: 2,
          lg: 4
        }}
        dataSource={emptyData}
        renderItem={() => (
          <List.Item>
            <Card
              loading
              cover={
                <div
                  className="listings-skeleton__card-cover-img"
                  style={{
                    backgroundImage: `url(${listingsLoadingCardCover})`
                  }}
                />
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};
