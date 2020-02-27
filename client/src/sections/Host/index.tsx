import React, { useState, FormEvent } from "react";
import { useMutation } from "@apollo/react-hooks";
import { Link, Redirect } from "react-router-dom";
import {
  Layout,
  Typography,
  Form,
  Input,
  InputNumber,
  Radio,
  Icon,
  Upload,
  Button
} from "antd";
import { FormComponentProps } from "antd/lib/form";
import { UploadChangeParam } from "antd/lib/upload";
import { Viewer } from "../../lib/types";
import { ListingType } from "../../lib/graphql/globalTypes";
import {
  iconColor,
  displayErrorMessage,
  displaySuccessNotification
} from "../../lib/utils";
import {
  HostListing as HostListingData,
  HostListingVariables
} from "../../lib/graphql/mutations/HostListing/__generated__/HostListing";
import { HOST_LISTING } from "../../lib/graphql";
import { useScrollToTop } from "../../lib/hooks";

interface Props {
  viewer: Viewer;
}

const { Content } = Layout;
const { Title, Text } = Typography;
const { Item } = Form;

export const Host = ({ viewer, form }: Props & FormComponentProps) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageBase64Value, setImageBase64Value] = useState<string | null>(null);
  const [hostListing, { loading, data }] = useMutation<
    HostListingData,
    HostListingVariables
  >(HOST_LISTING, {
    onError: () =>
      displayErrorMessage(
        "Sorry! We were'nt able to create your listing. Please try again later."
      ),
    onCompleted: () => {
      displaySuccessNotification("You've successfully created your listing!");
    }
  });

  useScrollToTop();

  const handleImageUpload = (info: UploadChangeParam) => {
    const { file } = info;
    if (file.status === "uploading") {
      setImageBase64Value(null);
      setImageLoading(true);
      return;
    }

    if (file.status === "done" && file.originFileObj) {
      getBase64Value(file.originFileObj, (imageBase64Value: string) => {
        setImageBase64Value(imageBase64Value);
        setImageLoading(false);
      });
    }
  };

  const handleHostListing = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    form.validateFields((error, values) => {
      if (error) {
        displayErrorMessage("Please complete all required form fields!");
        return;
      }

      const fullAddress = `${values.address}, ${values.city}, ${values.state}, ${values.zip}`;
      const input = {
        ...values,
        address: fullAddress,
        image: imageBase64Value,
        price: values.price * 100
      };

      delete input.city;
      delete input.state;
      delete input.zip;

      hostListing({
        variables: {
          input
        }
      });
    });
  };

  if (!viewer.id || !viewer.hasWallet) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            You'll have to be signed in and connected with Stripe to host a
            listing!
          </Title>
          <Text type="secondary">
            We only allow users who've signed in to our application and have
            connected with Stripe to host new listings. You can sign in at the{" "}
            <Link to="/login">/login</Link> page and connect with Stripe shortly
            after.
          </Text>
        </div>
      </Content>
    );
  }

  if (loading) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Please wait!
          </Title>
          <Text type="secondary">We're creating your listing now.</Text>
        </div>
      </Content>
    );
  }

  if (data && data.hostListing) {
    return <Redirect to={`/listing/${data.hostListing.id}`} />;
  }

  const { getFieldDecorator } = form;

  return (
    <Content className="host-content">
      <Form layout="vertical" onSubmit={handleHostListing}>
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Hi! Let's get started listing your place.
          </Title>
          <Text type="secondary">
            In this form, we'll collect some basic and additional information
            about your listing.
          </Text>
        </div>

        <Item label="Home Type">
          {getFieldDecorator("type", {
            rules: [
              {
                required: true,
                message: "Please select a home type!"
              }
            ]
          })(
            <Radio.Group>
              <Radio.Button value={ListingType.APARTMENT}>
                <Icon type="bank" style={{ color: iconColor }} />{" "}
                <span>Apartment</span>
              </Radio.Button>
              <Radio.Button value={ListingType.HOUSE}>
                <Icon type="home" style={{ color: iconColor }} />{" "}
                <span>House</span>
              </Radio.Button>
            </Radio.Group>
          )}
        </Item>

        <Item label="Max # of Guests" htmlFor="numOfGuests">
          {getFieldDecorator("numOfGuests", {
            rules: [
              {
                required: true,
                message: "Please enter the max number of guests!"
              }
            ]
          })(<InputNumber name="numOfGuests" min={1} placeholder="4" />)}
        </Item>

        <Item label="Title" extra="Max character count of 45" htmlFor="title">
          {getFieldDecorator("title", {
            rules: [
              {
                required: true,
                message: "Please enter a title for your listing!"
              }
            ]
          })(
            <Input
              name="title"
              maxLength={45}
              placeholder="The iconic and luxurious Bel-Air mansion"
            />
          )}
        </Item>

        <Item
          label="Description"
          extra="Max character count of 400"
          htmlFor="description"
        >
          {getFieldDecorator("description", {
            rules: [
              {
                required: true,
                message: "Please enter a description for your listing!"
              }
            ]
          })(
            <Input.TextArea
              name="description"
              rows={3}
              maxLength={400}
              placeholder="Modern, clean and iconic home of the Fresh Prince. Situated in the heart of Bel-Air, Los Angeles."
            />
          )}
        </Item>
        <Item label="Address" htmlFor="address">
          {getFieldDecorator("address", {
            rules: [
              {
                required: true,
                message: "Please enter an address for your listing!"
              }
            ]
          })(
            <Input
              placeholder="251 North Bristol Avenue"
              name="address"
              autoComplete="street-address"
            />
          )}
        </Item>

        <Item label="City/Town" htmlFor="city">
          {getFieldDecorator("city", {
            rules: [
              {
                required: true,
                message: "Please enter a city (or region) for your listing!"
              }
            ]
          })(
            <Input
              placeholder="Los Angeles"
              name="city"
              autoComplete="address-level2"
            />
          )}
        </Item>

        <Item label="State/Province" htmlFor="state">
          {getFieldDecorator("state", {
            rules: [
              {
                required: true,
                message: "Please enter a state (or province) for your listing!"
              }
            ]
          })(
            <Input
              placeholder="California"
              name="state"
              autoComplete="address-level1"
            />
          )}
        </Item>

        <Item label="Zip/Postal Code" htmlFor="zip">
          {getFieldDecorator("zip", {
            rules: [
              {
                required: true,
                message: "Please enter a zip (or postal) code for your listing!"
              }
            ]
          })(
            <Input
              placeholder="Please enter a zip code for your listing!"
              autoComplete="postal-code"
              name="zip"
            />
          )}
        </Item>

        <Item
          label="Image"
          extra="Images have to be under 1MB in size and of type JPG or PNG"
        >
          <div className="host__form-image-upload">
            {getFieldDecorator("image", {
              rules: [
                {
                  required: true,
                  message: "Please provide an image for your listing!"
                }
              ]
            })(
              <Upload
                name="image"
                listType="picture-card"
                showUploadList={false}
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                beforeUpload={beforeImageUpload}
                onChange={handleImageUpload}
              >
                {imageBase64Value ? (
                  <img src={imageBase64Value} alt="listing" />
                ) : (
                  <div>
                    <Icon type={imageLoading ? "loading" : "plus"} />
                    <div className="ant-upload-text">Upload</div>
                  </div>
                )}
              </Upload>
            )}
          </div>
        </Item>

        <Item label="Price" extra="All prices in $USD/day">
          {getFieldDecorator("price", {
            rules: [
              {
                required: true,
                message: "Please enter a price for your listing!"
              }
            ]
          })(<InputNumber min={0} placeholder="120" />)}
        </Item>

        <Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Item>
      </Form>
    </Content>
  );
};

const beforeImageUpload = (file: File): boolean => {
  const fileIsValidImage =
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp";
  const fileIsValidSize = file.size / 1024 / 1024 < 1;

  if (!fileIsValidImage) {
    displayErrorMessage("You're only able to upload valid JPG or PNG files!");
  }

  if (!fileIsValidSize) {
    displayErrorMessage(
      "You're only able to upload valid image files of under 1MB in size!"
    );
  }

  return fileIsValidImage && fileIsValidSize;
};

const getBase64Value = (
  file: File | Blob,
  callback: (imageBase64Value: string) => void
): void => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    if (typeof reader.result === "string") callback(reader.result);
  };
};

export const WrappedHost = Form.create<Props & FormComponentProps>({
  name: "host_form"
})(Host);
