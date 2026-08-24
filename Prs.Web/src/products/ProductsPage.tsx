import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import bootstrapIcons from "../assets/bootstrap-icons.svg";
import { IVendor } from "../vendors/IVendor";
import { vendorAPI } from "../vendors/VendorAPI";
import toast from "react-hot-toast";
import ProductList from "./ProductList";

function ProductsPage() {
  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const vendorIdParam = searchParams.get("vendorId");
  const parsedVendorId = vendorIdParam ? Number(vendorIdParam) : undefined;
  const vendorId = parsedVendorId && Number.isInteger(parsedVendorId) ? parsedVendorId : undefined;

  useEffect(() => {
    async function loadVendors() {
      try {
        const data = await vendorAPI.list();
        setVendors(data);
      } catch (error: any) {
        toast.error("Could not load vendors for the dropdown.", { duration: 6000 });
      }
    }

    loadVendors();
  }, []);

  function handleVendorChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedVendorId = event.target.value;

    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);

      if (selectedVendorId) {
        nextParams.set("vendorId", selectedVendorId);
      } else {
        nextParams.delete("vendorId");
      }

      return nextParams;
    });
  }

  return (
    <section className="content container-fluid mx-5 my-2 py-4">
      <div className="d-flex justify-content-between pb-4 mb-4 border-bottom border-2">
        <h2>Products</h2>
        <Link to={`/products/create`} className="btn btn-primary">
          <svg className="bi pe-none me-2" width={32} height={32} fill="#FFFFFF">
            <use xlinkHref={`${bootstrapIcons}#plus`} />
          </svg>
          Create a product
        </Link>
      </div>
      <div className="d-flex flex-column mb-4" style={{ width: "250px" }}>
        <label htmlFor="vendorId" className="form-label text-secondary mb-1">
          Vendor
        </label>
        <select id="vendorId" className="form-select" value={vendorId ?? ""} onChange={handleVendorChange}>
          <option value="">All vendors</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name}
            </option>
          ))}
        </select>
      </div>
      <ProductList vendorId={vendorId} />
    </section>
  );
}
export default ProductsPage;
