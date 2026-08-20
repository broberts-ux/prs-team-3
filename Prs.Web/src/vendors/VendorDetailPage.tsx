import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import type { IVendor } from "./IVendor";
import { vendorAPI } from "./VendorAPI";
import { formatPhoneNumber } from "../utility/formatUtilities";

function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [vendor, setVendor] = useState<IVendor>();

  useEffect(() => {
    const loadVendor = async () => {
      if (id) {
        const foundVendor = await vendorAPI.find(Number(id));
        setVendor(foundVendor);
      }
    };

    loadVendor();
  }, [id]);

  if (!vendor) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Vendor Details</h1>

        <Link to="/vendors" className="btn btn-outline-secondary">
          Back
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title mb-4">{vendor.name}</h2>

          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>Code:</strong> {vendor.code}
              </p>

              <p>
                <strong>Address:</strong> {vendor.address}
              </p>

              <p>
                <strong>City / State / Zip:</strong>{" "}
                {vendor.city}, {vendor.state} {vendor.zip}
              </p>
            </div>

            <div className="col-md-6">
              <p>
                <strong>Phone:</strong> {formatPhoneNumber(vendor.phone)}
              </p>

              <p>
                <strong>Email:</strong> {vendor.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mb-3">Products</h2>

      {vendor.products?.length ? (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Name</th>
                <th>Price</th>
                <th>Unit</th>
              </tr>
            </thead>

            <tbody>
              {vendor.products.map((product) => (
                <tr key={product.id}>
                  <td>{product.partNumber}</td>
                  <td>{product.name}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-secondary">
          This vendor does not supply any products.
        </p>
      )}
    </div>
  );
}

export default VendorDetailPage;