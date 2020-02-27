import React from "react";
import { Link } from "react-router-dom";
import { Typography, Input, Row, Col, Card } from "antd";
import torontoImage from "../../assets/toronto.jpg";
import dubaiImage from "../../assets/dubai.jpg";
import losAngelesImage from "../../assets/los-angeles.jpg";
import londonImage from "../../assets/london.jpg";

interface Props {
  onSearch: (value: string) => void;
}

const { Title } = Typography;
const { Search } = Input;

export const HomeHero = ({ onSearch }: Props) => {
  return (
    <div className="home-hero">
      <div className="home-hero__search">
        <Title className="home-hero__title">
          Find a place you'll love to stay at
        </Title>
        <Search
          placeholder="Search 'San Fransisco'"
          size="large"
          enterButton
          className="home-hero__search-input"
          onSearch={onSearch}
        />
      </div>
      <Row gutter={12} className="home-hero__cards">
        <Col md={6} xs={12}>
          <Link to="/listings/toronto">
            <Card
              cover={<img src={torontoImage} loading="lazy" alt="Toronto" />}
            >
              Toronto
            </Card>
          </Link>
        </Col>
        <Col md={6} xs={12}>
          <Link to="/listings/dubai">
            <Card cover={<img src={dubaiImage} alt="Dubai" loading="lazy" />}>
              Dubai
            </Card>
          </Link>
        </Col>
        <Col md={6} xs={0}>
          <Link to="/listings/los%20angeles">
            {" "}
            <Card
              cover={
                <img src={losAngelesImage} alt="Los Angeles" loading="lazy" />
              }
            >
              Los Angeles
            </Card>
          </Link>
        </Col>
        <Col md={6} xs={0}>
          <Link to="/listings/london">
            <Card cover={<img src={londonImage} alt="London" loading="lazy" />}>
              London
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
};
