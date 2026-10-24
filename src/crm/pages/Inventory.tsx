import { useState, useMemo } from "react";
import {
  Package,
  Layers,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Bookmark,
  Sliders,
  Plus,
  Eye,
  Pencil,
  Trash2,
  FileText,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { useCRM } from "../store";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  DetailRow,
  Field,
  Input,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  StatCard,
  Tabs,
  Toolbar,
  type Column,
} from "../components/ui-kit";
import { inr, dateFmt, todayISO } from "../utils/format";
import { stockAvailable, stockStatus, num, round2 } from "../utils";
import { INVENTORY_CATEGORIES, UNITS } from "../data";

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  unit: string;
  stock: number;
  reserved: number;
  purchaseRate: number;
  reorderLevel: number;
}

export interface StockMovement {
  id: string;
  itemId: string;
  date: string;
  type: "Received" | "Issued" | "Reserved" | "Adjustment";
  qty: number;
  projectId?: string;
  reference?: string;
  notes?: string;
  balanceAfter?: number;
}

const MOVEMENT_TYPES = ["Received", "Issued", "Reserved", "Adjustment"] as const;

export function Inventory() {
  const {
    data,
    toast,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addStockMovement,
  } = useCRM();

  const inventory: InventoryItem[] = (data.inventory || []) as InventoryItem[];
  const movements: StockMovement[] = (data.movements || []) as StockMovement[];
  const projects = data.projects || [];

  // Active Tab
  const [activeTab, setActiveTab] = useState<"Stock Master" | "Inventory Register">("Stock Master");

  // Stock Master Filters
  const [stockQuery, setStockQuery] = useState("");
  const [stockCategory, setStockCategory] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("");

  // Register Filters
  const [registerQuery, setRegisterQuery] = useState("");
  const [movementTypeFilter, setMovementTypeFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");

  // Modals state
  const [itemForm, setItemForm] = useState<Partial<InventoryItem> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [movementForm, setMovementForm] = useState<{
    itemId: string;
    type: "Received" | "Issued" | "Reserved" | "Adjustment";
    qty: string;
    date: string;
    projectId: string;
    reference: string;
    notes: string;
  } | null>(null);
  const [movementErrors, setMovementErrors] = useState<Record<string, string>>({});

  // View Item History Modal
  const [viewItemId, setViewItemId] = useState<string | null>(null);

  // Delete Item Confirmation
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);

  /* ---------------- Stock Master Calculations ---------------- */
  const stockMetrics = useMemo(() => {
    let totalValuation = 0;
    let lowOrOutCount = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let totalReservedUnits = 0;
    let totalReservedValue = 0;

    inventory.forEach((item) => {
      const stock = num(item.stock);
      const rate = num(item.purchaseRate);
      const reserved = num(item.reserved);
      totalValuation += stock * rate;
      totalReservedUnits += reserved;
      totalReservedValue += reserved * rate;

      const st = stockStatus(item);
      if (st === "Out of Stock") {
        outOfStockCount++;
        lowOrOutCount++;
      } else if (st === "Low Stock") {
        lowStockCount++;
        lowOrOutCount++;
      }
    });

    const categorySet = new Set(inventory.map((i) => i.category).filter(Boolean));

    return {
      totalValuation: round2(totalValuation),
      totalItems: inventory.length,
      categoriesCount: categorySet.size,
      lowOrOutCount,
      outOfStockCount,
      lowStockCount,
      totalReservedUnits: round2(totalReservedUnits),
      totalReservedValue: round2(totalReservedValue),
    };
  }, [inventory]);

  /* ---------------- Filtered Stock Master Rows ---------------- */
  const filteredStockRows = useMemo(() => {
    return inventory.filter((item) => {
      if (stockCategory && item.category !== stockCategory) return false;
      if (stockStatusFilter && stockStatus(item) !== stockStatusFilter) return false;
      if (stockQuery.trim()) {
        const q = stockQuery.toLowerCase();
        const matchesCode = item.code?.toLowerCase().includes(q);
        const matchesName = item.name?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesCat = item.category?.toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [inventory, stockCategory, stockStatusFilter, stockQuery]);

  /* ---------------- Inventory Register Calculations ---------------- */
  const registerMetrics = useMemo(() => {
    let totalReceivedQty = 0;
    let totalIssuedQty = 0;
    let totalReservedQty = 0;
    let receivedCount = 0;
    let issuedCount = 0;
    let reservedCount = 0;
    let adjustmentCount = 0;

    movements.forEach((m) => {
      const q = num(m.qty);
      if (m.type === "Received") {
        totalReceivedQty += q;
        receivedCount++;
      } else if (m.type === "Issued") {
        totalIssuedQty += q;
        issuedCount++;
      } else if (m.type === "Reserved") {
        totalReservedQty += q;
        reservedCount++;
      } else if (m.type === "Adjustment") {
        adjustmentCount++;
      }
    });

    return {
      totalMovements: movements.length,
      totalReceivedQty: round2(totalReceivedQty),
      totalIssuedQty: round2(totalIssuedQty),
      totalReservedQty: round2(totalReservedQty),
      receivedCount,
      issuedCount,
      reservedCount,
      adjustmentCount,
    };
  }, [movements]);

  /* ---------------- Filtered Register Rows ---------------- */
  const filteredRegisterRows = useMemo(() => {
    return movements.filter((m) => {
      if (movementTypeFilter && m.type !== movementTypeFilter) return false;
      if (projectFilter && m.projectId !== projectFilter) return false;
      if (itemFilter && m.itemId !== itemFilter) return false;
      if (registerQuery.trim()) {
        const q = registerQuery.toLowerCase();
        const item = inventory.find((x) => x.id === m.itemId);
        const proj = projects.find((p) => p.id === m.projectId);
        const matchesRef = m.reference?.toLowerCase().includes(q);
        const matchesNotes = m.notes?.toLowerCase().includes(q);
        const matchesItemCode = item?.code?.toLowerCase().includes(q);
        const matchesItemName = item?.name?.toLowerCase().includes(q);
        const matchesProjCode = proj?.code?.toLowerCase().includes(q);
        const matchesProjName = proj?.name?.toLowerCase().includes(q);
        if (
          !matchesRef &&
          !matchesNotes &&
          !matchesItemCode &&
          !matchesItemName &&
          !matchesProjCode &&
          !matchesProjName
        ) {
          return false;
        }
      }
      return true;
    });
  }, [movements, movementTypeFilter, projectFilter, itemFilter, registerQuery, inventory, projects]);

  /* ---------------- Handlers: Item Add / Edit ---------------- */
  const openAddItemModal = () => {
    setFormErrors({});
    setItemForm({
      code: "",
      name: "",
      category: INVENTORY_CATEGORIES[0] || "uPVC Profiles",
      unit: "Mtr",
      description: "",
      stock: 0,
      reserved: 0,
      purchaseRate: 0,
      reorderLevel: 10,
    });
  };

  const openEditItemModal = (item: InventoryItem) => {
    setFormErrors({});
    setItemForm({ ...item });
  };

  const handleSaveItem = () => {
    if (!itemForm) return;
    const errors: Record<string, string> = {};

    if (!itemForm.code?.trim()) {
      errors.code = "Item code is required";
    } else {
      const exists = inventory.some(
        (x) => x.id !== itemForm.id && x.code.toLowerCase() === itemForm.code?.trim().toLowerCase()
      );
      if (exists) errors.code = "Item code already exists";
    }

    if (!itemForm.name?.trim()) {
      errors.name = "Item name is required";
    }

    const stock = num(itemForm.stock);
    const reserved = num(itemForm.reserved);
    const purchaseRate = num(itemForm.purchaseRate);
    const reorderLevel = num(itemForm.reorderLevel);

    if (stock < 0) errors.stock = "Stock cannot be negative";
    if (reserved < 0) errors.reserved = "Reserved stock cannot be negative";
    if (reserved > stock) errors.reserved = "Reserved cannot exceed total stock";
    if (purchaseRate < 0) errors.purchaseRate = "Purchase rate cannot be negative";
    if (reorderLevel < 0) errors.reorderLevel = "Reorder level cannot be negative";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (itemForm.id) {
      updateInventoryItem(itemForm.id, {
        code: itemForm.code!.trim(),
        name: itemForm.name!.trim(),
        category: itemForm.category || "uPVC Profiles",
        unit: itemForm.unit || "Nos",
        description: itemForm.description || "",
        stock,
        reserved,
        purchaseRate,
        reorderLevel,
      });
      toast("Material item updated successfully");
    } else {
      addInventoryItem({
        code: itemForm.code!.trim(),
        name: itemForm.name!.trim(),
        category: itemForm.category || "uPVC Profiles",
        unit: itemForm.unit || "Nos",
        description: itemForm.description || "",
        stock,
        reserved,
        purchaseRate,
        reorderLevel,
      });
      toast("Material item added to inventory");
    }

    setItemForm(null);
  };

  /* ---------------- Handlers: Stock Movement ---------------- */
  const openRecordMovementModal = (preselectedItemId?: string) => {
    setMovementErrors({});
    const initialItemId = preselectedItemId || inventory[0]?.id || "";
    setMovementForm({
      itemId: initialItemId,
      type: "Received",
      qty: "",
      date: todayISO(),
      projectId: "",
      reference: "",
      notes: "",
    });
  };

  const handleSaveMovement = () => {
    if (!movementForm) return;
    const errors: Record<string, string> = {};

    const item = inventory.find((x) => x.id === movementForm.itemId);
    if (!item) {
      errors.itemId = "Please select an inventory item";
      setMovementErrors(errors);
      return;
    }

    const qn = num(movementForm.qty);
    if (movementForm.type !== "Adjustment" && qn <= 0) {
      errors.qty = "Quantity must be greater than 0";
    }
    if (movementForm.type === "Adjustment" && qn === 0) {
      errors.qty = "Adjustment quantity cannot be 0";
    }

    const currentStock = num(item.stock);
    const available = stockAvailable(item);

    if (movementForm.type === "Issued" && qn > currentStock) {
      errors.qty = `Cannot issue ${qn} ${item.unit}. Only ${currentStock} ${item.unit} in stock.`;
    }

    if (movementForm.type === "Reserved" && qn > available) {
      errors.qty = `Cannot reserve ${qn} ${item.unit}. Only ${available} ${item.unit} available.`;
    }

    if (movementForm.type === "Adjustment" && currentStock + qn < 0) {
      errors.qty = `Adjustment would make stock negative (${currentStock + qn} ${item.unit}).`;
    }

    if (!movementForm.date) {
      errors.date = "Movement date is required";
    }

    setMovementErrors(errors);
    if (Object.keys(errors).length > 0) return;

    addStockMovement({
      itemId: item.id,
      type: movementForm.type,
      qty: qn,
      date: movementForm.date,
      projectId: movementForm.projectId || "",
      reference: movementForm.reference?.trim() || "",
      notes: movementForm.notes?.trim() || "",
    });

    toast(`Stock ${movementForm.type.toLowerCase()} of ${Math.abs(qn)} ${item.unit} recorded for ${item.code}`);
    setMovementForm(null);
  };

  /* ---------------- Handlers: Delete Item ---------------- */
  const handleConfirmDelete = () => {
    if (!deleteItem) return;
    deleteInventoryItem(deleteItem.id);
    toast(`Item ${deleteItem.code} deleted`);
    setDeleteItem(null);
  };

  /* ---------------- Columns: Stock Master ---------------- */
  const stockColumns: Column<InventoryItem>[] = [
    {
      key: "code",
      header: "Code",
      render: (r) => <span className="font-mono font-bold text-neutral-900">{r.code}</span>,
      sortValue: (r) => r.code,
    },
    {
      key: "name",
      header: "Material Item & Category",
      render: (r) => (
        <div className="min-w-[180px]">
          <div className="font-semibold text-neutral-900">{r.name}</div>
          <div className="text-xs text-neutral-500">{r.category}</div>
        </div>
      ),
      sortValue: (r) => r.name,
    },
    {
      key: "unit",
      header: "Unit",
      render: (r) => <span className="text-xs font-medium text-neutral-600">{r.unit}</span>,
      sortValue: (r) => r.unit,
    },
    {
      key: "stock",
      header: "In Stock",
      render: (r) => (
        <span className="font-semibold text-neutral-900">
          {num(r.stock).toLocaleString()} <span className="text-xs text-neutral-400 font-normal">{r.unit}</span>
        </span>
      ),
      sortValue: (r) => num(r.stock),
      className: "text-right",
    },
    {
      key: "reserved",
      header: "Reserved",
      render: (r) => {
        const res = num(r.reserved);
        return res > 0 ? (
          <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
            {res.toLocaleString()} {r.unit}
          </span>
        ) : (
          <span className="text-neutral-400">—</span>
        );
      },
      sortValue: (r) => num(r.reserved),
      className: "text-right",
    },
    {
      key: "available",
      header: "Available",
      render: (r) => {
        const avail = stockAvailable(r);
        return (
          <span className={`font-semibold ${avail <= 0 ? "text-rose-600" : "text-emerald-700"}`}>
            {avail.toLocaleString()} <span className="text-xs font-normal text-neutral-400">{r.unit}</span>
          </span>
        );
      },
      sortValue: (r) => stockAvailable(r),
      className: "text-right",
    },
    {
      key: "purchaseRate",
      header: "Purchase Rate",
      render: (r) => (
        <span className="font-medium text-neutral-800">
          {inr(num(r.purchaseRate))} <span className="text-xs text-neutral-400">/{r.unit}</span>
        </span>
      ),
      sortValue: (r) => num(r.purchaseRate),
      className: "text-right",
    },
    {
      key: "valuation",
      header: "Total Value",
      render: (r) => {
        const val = round2(num(r.stock) * num(r.purchaseRate));
        return <span className="font-bold text-neutral-900">{inr(val)}</span>;
      },
      sortValue: (r) => num(r.stock) * num(r.purchaseRate),
      className: "text-right",
    },
    {
      key: "reorderLevel",
      header: "Reorder Lvl",
      render: (r) => (
        <span className="text-xs text-neutral-500">
          {num(r.reorderLevel)} {r.unit}
        </span>
      ),
      sortValue: (r) => num(r.reorderLevel),
      className: "text-right",
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const st = stockStatus(r);
        const tone = st === "In Stock" ? "success" : st === "Low Stock" ? "warning" : "danger";
        return <Badge value={st} tone={tone} />;
      },
      sortValue: (r) => stockStatus(r),
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            title="Record Stock In/Out"
            className="flex h-7 items-center gap-1 rounded bg-neutral-100 px-2 text-xs font-medium text-neutral-700 hover:bg-neutral-200 transition-colors"
            onClick={() => openRecordMovementModal(r.id)}
          >
            <ArrowDownLeft className="size-3.5 text-emerald-600" />
            <ArrowUpRight className="size-3.5 text-blue-600" />
            <span>Stock</span>
          </button>
          <button
            title="View Stock Ledger History"
            className="grid size-7 place-items-center rounded text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            onClick={() => setViewItemId(r.id)}
          >
            <Eye className="size-3.5" />
          </button>
          <button
            title="Edit Item Master"
            className="grid size-7 place-items-center rounded text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            onClick={() => openEditItemModal(r)}
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            title="Delete Item"
            className="grid size-7 place-items-center rounded text-neutral-500 hover:bg-rose-50 hover:text-rose-600"
            onClick={() => setDeleteItem(r)}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ),
      className: "text-right",
    },
  ];

  /* ---------------- Columns: Inventory Register ---------------- */
  const registerColumns: Column<StockMovement>[] = [
    {
      key: "date",
      header: "Date",
      render: (r) => <span className="whitespace-nowrap font-medium text-neutral-900">{dateFmt(r.date)}</span>,
      sortValue: (r) => r.date,
    },
    {
      key: "reference",
      header: "Slip / Ref #",
      render: (r) => (
        <span className="font-mono text-xs font-bold text-neutral-700">
          {r.reference || "—"}
        </span>
      ),
      sortValue: (r) => r.reference || "",
    },
    {
      key: "type",
      header: "Type",
      render: (r) => {
        if (r.type === "Received") {
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              <ArrowDownLeft className="size-3" />
              Received (GRN)
            </span>
          );
        }
        if (r.type === "Issued") {
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
              <ArrowUpRight className="size-3" />
              Issued (Fab)
            </span>
          );
        }
        if (r.type === "Reserved") {
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
              <Bookmark className="size-3" />
              Reserved
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 ring-1 ring-inset ring-purple-600/20">
            <Sliders className="size-3" />
            Adjustment
          </span>
        );
      },
      sortValue: (r) => r.type,
    },
    {
      key: "item",
      header: "Material Item",
      render: (r) => {
        const it = inventory.find((x) => x.id === r.itemId);
        return (
          <div className="min-w-[170px]">
            <span className="font-mono text-xs font-bold text-neutral-800 mr-1.5">{it?.code || "—"}</span>
            <span className="text-sm font-medium text-neutral-900">{it?.name || "Unknown item"}</span>
            <div className="text-xs text-neutral-400">{it?.category || ""}</div>
          </div>
        );
      },
      sortValue: (r) => {
        const it = inventory.find((x) => x.id === r.itemId);
        return it?.name || "";
      },
    },
    {
      key: "qty",
      header: "Quantity",
      render: (r) => {
        const it = inventory.find((x) => x.id === r.itemId);
        const unit = it?.unit || "Units";
        const q = num(r.qty);

        if (r.type === "Received") {
          return (
            <span className="font-bold text-emerald-700">
              +{q.toLocaleString()} <span className="text-xs font-normal text-emerald-600">{unit}</span>
            </span>
          );
        }
        if (r.type === "Issued") {
          return (
            <span className="font-bold text-rose-600">
              -{q.toLocaleString()} <span className="text-xs font-normal text-rose-500">{unit}</span>
            </span>
          );
        }
        if (r.type === "Reserved") {
          return (
            <span className="font-semibold text-amber-700">
              {q.toLocaleString()} <span className="text-xs font-normal text-amber-600">{unit}</span>
            </span>
          );
        }
        // Adjustment
        return (
          <span className={`font-bold ${q >= 0 ? "text-purple-700" : "text-rose-700"}`}>
            {q > 0 ? `+${q}` : q} <span className="text-xs font-normal text-neutral-400">{unit}</span>
          </span>
        );
      },
      sortValue: (r) => num(r.qty),
      className: "text-right",
    },
    {
      key: "project",
      header: "Linked Project",
      render: (r) => {
        if (!r.projectId) return <span className="text-neutral-400 text-xs">General / Central Store</span>;
        const p = projects.find((x) => x.id === r.projectId);
        return p ? (
          <div className="text-xs">
            <span className="font-mono font-semibold text-neutral-800 mr-1">{p.code}</span>
            <span className="text-neutral-600">{p.name}</span>
          </div>
        ) : (
          <span className="text-xs text-neutral-400">Project #{r.projectId}</span>
        );
      },
      sortValue: (r) => {
        const p = projects.find((x) => x.id === r.projectId);
        return p?.name || "";
      },
    },
    {
      key: "notes",
      header: "Remarks & Purpose",
      render: (r) => (
        <span className="text-xs text-neutral-600 max-w-[240px] truncate block" title={r.notes}>
          {r.notes || "—"}
        </span>
      ),
      sortValue: (r) => r.notes || "",
    },
    {
      key: "balanceAfter",
      header: "Balance After",
      render: (r) => {
        const it = inventory.find((x) => x.id === r.itemId);
        if (r.balanceAfter === undefined || r.balanceAfter === null) return <span className="text-neutral-400">—</span>;
        return (
          <span className="font-mono text-xs font-bold text-neutral-800">
            {num(r.balanceAfter).toLocaleString()} {it?.unit || ""}
          </span>
        );
      },
      sortValue: (r) => num(r.balanceAfter),
      className: "text-right",
    },
  ];

  // Selected item for View Details Modal
  const viewedItem = inventory.find((x) => x.id === viewItemId);
  const viewedItemMovements = useMemo(() => {
    if (!viewItemId) return [];
    return movements.filter((m) => m.itemId === viewItemId);
  }, [viewItemId, movements]);

  // Selected item for the Movement Modal
  const activeMovementItem = inventory.find((x) => x.id === movementForm?.itemId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Inventory & Stock Register"
        description="Track uPVC manufacturing raw materials, monitor stock levels, and track complete inward/outward ledger."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openRecordMovementModal()}
              className="border-neutral-300"
            >
              <ClipboardList className="size-4 text-neutral-700" />
              <span>Record Movement</span>
            </Button>
            <Button size="sm" onClick={openAddItemModal}>
              <Plus className="size-4" />
              <span>Add Material Item</span>
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <Tabs
        tabs={["Stock Master", "Inventory Register"]}
        active={activeTab}
        onChange={(t) => setActiveTab(t as any)}
      />

      {/* ======================================================== */}
      {/* TAB 1: STOCK MASTER */}
      {/* ======================================================== */}
      {activeTab === "Stock Master" && (
        <div className="space-y-4">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Raw Materials"
              value={stockMetrics.totalItems}
              hint={`Across ${stockMetrics.categoriesCount} uPVC profile & fitting categories`}
              icon={<Package className="size-5 text-neutral-700" />}
              tone="default"
            />
            <StatCard
              label="Total Stock Valuation"
              value={inr(stockMetrics.totalValuation)}
              hint="Calculated at raw material purchase cost"
              icon={<CheckCircle2 className="size-5 text-emerald-600" />}
              tone="success"
            />
            <StatCard
              label="Stock Alerts"
              value={`${stockMetrics.lowOrOutCount} Items`}
              hint={`${stockMetrics.outOfStockCount} out of stock · ${stockMetrics.lowStockCount} below reorder`}
              icon={<AlertTriangle className="size-5 text-amber-600" />}
              tone={stockMetrics.lowOrOutCount > 0 ? "warning" : "muted"}
            />
            <StatCard
              label="Project Reserved Stock"
              value={`${stockMetrics.totalReservedUnits.toLocaleString()} Units`}
              hint={`Valued at ${inr(stockMetrics.totalReservedValue)} committed to fabrication`}
              icon={<Bookmark className="size-5 text-indigo-600" />}
              tone="accent"
            />
          </div>

          {/* Table Container */}
          <Card className="overflow-hidden">
            {/* Toolbar Filters */}
            <Toolbar>
              <SearchInput
                value={stockQuery}
                onChange={setStockQuery}
                placeholder="Search code, name, description…"
                className="max-w-sm"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={stockCategory}
                  onChange={(e) => setStockCategory(e.target.value)}
                  placeholder="All Categories"
                  options={INVENTORY_CATEGORIES}
                  className="w-44 text-xs"
                />
                <Select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  placeholder="All Stock Status"
                  options={["In Stock", "Low Stock", "Out of Stock"]}
                  className="w-38 text-xs"
                />
                {(stockQuery || stockCategory || stockStatusFilter) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStockQuery("");
                      setStockCategory("");
                      setStockStatusFilter("");
                    }}
                    className="text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </Toolbar>

            {/* DataTable */}
            <DataTable
              rows={filteredStockRows}
              columns={stockColumns}
              onRowClick={(row) => setViewItemId(row.id)}
              pageSize={10}
              empty={
                <div className="py-12 text-center text-sm text-neutral-500">
                  <Package className="mx-auto mb-2 size-8 text-neutral-300" />
                  No inventory items match your search.
                </div>
              }
            />
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: INVENTORY REGISTER (MATERIAL LEDGER) */}
      {/* ======================================================== */}
      {activeTab === "Inventory Register" && (
        <div className="space-y-4">
          {/* Top Metrics Cards for Register */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Transactions"
              value={registerMetrics.totalMovements}
              hint="All historical inward, outward & reservations"
              icon={<ClipboardList className="size-5 text-neutral-700" />}
              tone="default"
            />
            <StatCard
              label="Material Receipts (GRN)"
              value={`${registerMetrics.totalReceivedQty.toLocaleString()} Units`}
              hint={`${registerMetrics.receivedCount} supplier deliveries received`}
              icon={<ArrowDownLeft className="size-5 text-emerald-600" />}
              tone="success"
            />
            <StatCard
              label="Issued to Fabrication"
              value={`${registerMetrics.totalIssuedQty.toLocaleString()} Units`}
              hint={`${registerMetrics.issuedCount} issues for project manufacturing`}
              icon={<ArrowUpRight className="size-5 text-blue-600" />}
              tone="accent"
            />
            <StatCard
              label="Audit Adjustments"
              value={`${registerMetrics.adjustmentCount} Records`}
              hint="Physical count audits & scrap write-offs"
              icon={<Sliders className="size-5 text-amber-600" />}
              tone="warning"
            />
          </div>

          {/* Register Table Container */}
          <Card className="overflow-hidden">
            {/* Toolbar Filters */}
            <Toolbar>
              <SearchInput
                value={registerQuery}
                onChange={setRegisterQuery}
                placeholder="Search slip #, item, notes, project…"
                className="max-w-sm"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={movementTypeFilter}
                  onChange={(e) => setMovementTypeFilter(e.target.value)}
                  placeholder="All Movement Types"
                  options={[
                    { value: "Received", label: "Received (GRN Inward)" },
                    { value: "Issued", label: "Issued (Workshop Dispatch)" },
                    { value: "Reserved", label: "Reserved (Project Allocation)" },
                    { value: "Adjustment", label: "Adjustment (Audit / Scrap)" },
                  ]}
                  className="w-48 text-xs"
                />
                <Select
                  value={itemFilter}
                  onChange={(e) => setItemFilter(e.target.value)}
                  placeholder="All Material Items"
                  options={inventory.map((i) => ({ value: i.id, label: `${i.code} · ${i.name}` }))}
                  className="w-52 text-xs"
                />
                <Select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  placeholder="All Projects"
                  options={projects.map((p) => ({ value: p.id, label: `${p.code} · ${p.name}` }))}
                  className="w-48 text-xs"
                />
                {(registerQuery || movementTypeFilter || itemFilter || projectFilter) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRegisterQuery("");
                      setMovementTypeFilter("");
                      setItemFilter("");
                      setProjectFilter("");
                    }}
                    className="text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </Toolbar>

            {/* DataTable */}
            <DataTable
              rows={filteredRegisterRows}
              columns={registerColumns}
              pageSize={12}
              empty={
                <div className="py-12 text-center text-sm text-neutral-500">
                  <ClipboardList className="mx-auto mb-2 size-8 text-neutral-300" />
                  No stock movements found matching your filters.
                </div>
              }
            />
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT ITEM MASTER (NO SELLING RATE!) */}
      {/* ======================================================== */}
      {itemForm && (
        <Modal
          open
          title={itemForm.id ? `Edit Item · ${itemForm.code}` : "Add Material Item"}
          subtitle="Define raw materials, profile extrusions, glass, and hardware accessories for manufacturing."
          onClose={() => setItemForm(null)}
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setItemForm(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveItem}>Save Material Item</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Item Code" required error={formErrors.code}>
                <Input
                  value={itemForm.code || ""}
                  onChange={(e) => setItemForm({ ...itemForm, code: e.target.value })}
                  placeholder="e.g. PRF-001, GLS-005"
                />
              </Field>
              <Field label="Item Name" required error={formErrors.name}>
                <Input
                  value={itemForm.name || ""}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g. Sliding Frame Profile 60mm"
                />
              </Field>
              <Field label="Category">
                <Select
                  value={itemForm.category || INVENTORY_CATEGORIES[0]}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                  options={INVENTORY_CATEGORIES}
                />
              </Field>
              <Field label="Measurement Unit">
                <Select
                  value={itemForm.unit || UNITS[0]}
                  onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                  options={UNITS}
                />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <Input
                  value={itemForm.description || ""}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="e.g. White uPVC 2-track outer frame, 6m extrusion length"
                />
              </Field>
              {!itemForm.id && (
                <Field
                  label="Opening Stock"
                  error={formErrors.stock}
                  hint="Initial quantity in warehouse (will log an opening receipt movement)"
                >
                  <Input
                    type="number"
                    min="0"
                    step="any"
                    value={itemForm.stock ?? 0}
                    onChange={(e) => setItemForm({ ...itemForm, stock: Number(e.target.value) })}
                  />
                </Field>
              )}
              <Field
                label="Reserved Stock"
                error={formErrors.reserved}
                hint="Quantity already committed to fabrication"
              >
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={itemForm.reserved ?? 0}
                  onChange={(e) => setItemForm({ ...itemForm, reserved: Number(e.target.value) })}
                />
              </Field>
              <Field
                label="Purchase Rate (₹ Cost)"
                error={formErrors.purchaseRate}
                hint="Raw material inward cost per unit"
              >
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={itemForm.purchaseRate ?? 0}
                  onChange={(e) => setItemForm({ ...itemForm, purchaseRate: Number(e.target.value) })}
                />
              </Field>
              <Field
                label="Reorder Level"
                error={formErrors.reorderLevel}
                hint="Threshold to trigger low stock alert"
              >
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={itemForm.reorderLevel ?? 0}
                  onChange={(e) => setItemForm({ ...itemForm, reorderLevel: Number(e.target.value) })}
                />
              </Field>
            </div>

            <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500 border border-neutral-200">
              <span className="font-semibold text-neutral-700">Note:</span> Inventory valuation is purely based on
              purchased raw material cost (<span className="font-mono">Stock × Purchase Rate</span>). Raw materials are
              consumed in window/door manufacturing projects and are not sold at retail.
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL: RECORD STOCK MOVEMENT */}
      {/* ======================================================== */}
      {movementForm && (
        <Modal
          open
          title="Record Stock Movement"
          subtitle="Log material receipts, workshop issues to fabrication, project reservations, or audit adjustments."
          onClose={() => setMovementForm(null)}
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setMovementForm(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveMovement}>Record Movement</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Material Item" required error={movementErrors.itemId} className="sm:col-span-2">
                <Select
                  value={movementForm.itemId}
                  onChange={(e) => setMovementForm({ ...movementForm, itemId: e.target.value })}
                  options={inventory.map((i) => ({
                    value: i.id,
                    label: `${i.code} · ${i.name} (${i.stock} ${i.unit} in stock)`,
                  }))}
                />
              </Field>

              {activeMovementItem && (
                <div className="sm:col-span-2 rounded-lg bg-neutral-50 p-3 border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500">Current Stock:</span>{" "}
                    <span className="font-bold text-neutral-900">
                      {num(activeMovementItem.stock).toLocaleString()} {activeMovementItem.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Reserved:</span>{" "}
                    <span className="font-semibold text-amber-700">
                      {num(activeMovementItem.reserved).toLocaleString()} {activeMovementItem.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Available:</span>{" "}
                    <span className="font-bold text-emerald-700">
                      {stockAvailable(activeMovementItem).toLocaleString()} {activeMovementItem.unit}
                    </span>
                  </div>
                </div>
              )}

              <Field label="Movement Type" required>
                <Select
                  value={movementForm.type}
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, type: e.target.value as any })
                  }
                  options={[
                    { value: "Received", label: "Received (GRN Supplier Delivery)" },
                    { value: "Issued", label: "Issued (Workshop Fabrication Issue)" },
                    { value: "Reserved", label: "Reserved (Allocate to Project)" },
                    { value: "Adjustment", label: "Adjustment (Physical Audit / Scrap)" },
                  ]}
                />
              </Field>

              <Field
                label={movementForm.type === "Adjustment" ? "Quantity (+/- Adjust)" : "Quantity"}
                required
                error={movementErrors.qty}
                hint={
                  activeMovementItem
                    ? movementForm.type === "Issued"
                      ? `Max available to issue: ${activeMovementItem.stock} ${activeMovementItem.unit}`
                      : movementForm.type === "Reserved"
                        ? `Max available to reserve: ${stockAvailable(activeMovementItem)} ${activeMovementItem.unit}`
                        : movementForm.type === "Adjustment"
                          ? "Enter positive number to increase, negative to decrease"
                          : `Unit: ${activeMovementItem.unit}`
                    : undefined
                }
              >
                <Input
                  type="number"
                  step="any"
                  value={movementForm.qty}
                  onChange={(e) => setMovementForm({ ...movementForm, qty: e.target.value })}
                  placeholder="0"
                />
              </Field>

              <Field label="Movement Date" required error={movementErrors.date}>
                <Input
                  type="date"
                  value={movementForm.date}
                  onChange={(e) => setMovementForm({ ...movementForm, date: e.target.value })}
                />
              </Field>

              <Field label="Linked Project (Optional)" hint="For project issues or material reservations">
                <Select
                  value={movementForm.projectId}
                  onChange={(e) => setMovementForm({ ...movementForm, projectId: e.target.value })}
                  placeholder="— None (General Factory Stock) —"
                  options={projects.map((p) => ({
                    value: p.id,
                    label: `${p.code} · ${p.name}`,
                  }))}
                />
              </Field>

              <Field
                label="Reference / Slip #"
                hint="e.g. GRN-240, ISS-131, AUD-04, PO-5012"
                className="sm:col-span-2"
              >
                <Input
                  value={movementForm.reference}
                  onChange={(e) => setMovementForm({ ...movementForm, reference: e.target.value })}
                  placeholder="e.g. GRN-2026-001"
                />
              </Field>

              <Field
                label="Remarks / Notes"
                hint="Reason or details for this stock movement"
                className="sm:col-span-2"
              >
                <Input
                  value={movementForm.notes}
                  onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
                  placeholder="e.g. Supplier delivery for tower A sliding profiles"
                />
              </Field>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL: ITEM DETAIL & MOVEMENT HISTORY */}
      {/* ======================================================== */}
      {viewedItem && (
        <Modal
          open
          title={`${viewedItem.code} · ${viewedItem.name}`}
          subtitle="Detailed material specifications, current warehouse stock, and full movement ledger."
          onClose={() => setViewItemId(null)}
          size="lg"
          footer={
            <div className="flex w-full items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setViewItemId(null);
                  openRecordMovementModal(viewedItem.id);
                }}
              >
                <ClipboardList className="size-4" />
                <span>Record Movement for this Item</span>
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setViewItemId(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-3">
                <span className="text-xs font-semibold uppercase text-neutral-500">In Stock</span>
                <p className="mt-1 text-lg font-extrabold text-neutral-900">
                  {num(viewedItem.stock).toLocaleString()} <span className="text-xs font-normal text-neutral-500">{viewedItem.unit}</span>
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-3">
                <span className="text-xs font-semibold uppercase text-neutral-500">Available</span>
                <p className="mt-1 text-lg font-extrabold text-emerald-700">
                  {stockAvailable(viewedItem).toLocaleString()} <span className="text-xs font-normal text-neutral-500">{viewedItem.unit}</span>
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-3">
                <span className="text-xs font-semibold uppercase text-neutral-500">Purchase Rate</span>
                <p className="mt-1 text-lg font-extrabold text-neutral-900">
                  {inr(num(viewedItem.purchaseRate))}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-3">
                <span className="text-xs font-semibold uppercase text-neutral-500">Total Value</span>
                <p className="mt-1 text-lg font-extrabold text-neutral-900">
                  {inr(round2(num(viewedItem.stock) * num(viewedItem.purchaseRate)))}
                </p>
              </div>
            </div>

            {/* Item Details */}
            <div className="rounded-xl border border-neutral-200 p-4">
              <DetailRow label="Category" value={viewedItem.category} />
              <DetailRow label="Unit of Measure" value={viewedItem.unit} />
              <DetailRow label="Description" value={viewedItem.description || "—"} />
              <DetailRow
                label="Reserved Stock"
                value={
                  num(viewedItem.reserved) > 0 ? (
                    <span className="font-semibold text-amber-700">
                      {num(viewedItem.reserved).toLocaleString()} {viewedItem.unit}
                    </span>
                  ) : (
                    "0"
                  )
                }
              />
              <DetailRow
                label="Reorder Threshold"
                value={`${num(viewedItem.reorderLevel)} ${viewedItem.unit}`}
              />
              <DetailRow
                label="Status"
                value={
                  <Badge
                    value={stockStatus(viewedItem)}
                    tone={
                      stockStatus(viewedItem) === "In Stock"
                        ? "success"
                        : stockStatus(viewedItem) === "Low Stock"
                          ? "warning"
                          : "danger"
                    }
                  />
                }
              />
            </div>

            {/* Movement Ledger for This Item */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-neutral-900">
                  Stock Movement Ledger ({viewedItemMovements.length} records)
                </h4>
              </div>

              {viewedItemMovements.length === 0 ? (
                <div className="rounded-lg border border-neutral-200 p-6 text-center text-xs text-neutral-500">
                  No stock movements recorded yet for this material item.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-neutral-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Ref #</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2">Project</th>
                        <th className="px-3 py-2">Remarks</th>
                        <th className="px-3 py-2 text-right">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {viewedItemMovements.map((m) => {
                        const proj = projects.find((p) => p.id === m.projectId);
                        const q = num(m.qty);
                        return (
                          <tr key={m.id} className="hover:bg-neutral-50/60">
                            <td className="px-3 py-2 font-medium text-neutral-900">{dateFmt(m.date)}</td>
                            <td className="px-3 py-2 font-mono text-neutral-700">{m.reference || "—"}</td>
                            <td className="px-3 py-2">
                              {m.type === "Received" ? (
                                <span className="font-semibold text-emerald-700">+Received</span>
                              ) : m.type === "Issued" ? (
                                <span className="font-semibold text-rose-600">-Issued</span>
                              ) : m.type === "Reserved" ? (
                                <span className="font-semibold text-amber-700">Reserved</span>
                              ) : (
                                <span className="font-semibold text-purple-700">Adjustment</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-bold">
                              {m.type === "Received" ? (
                                <span className="text-emerald-700">+{q.toLocaleString()}</span>
                              ) : m.type === "Issued" ? (
                                <span className="text-rose-600">-{q.toLocaleString()}</span>
                              ) : (
                                <span>{q.toLocaleString()}</span>
                              )}{" "}
                              <span className="font-normal text-neutral-400">{viewedItem.unit}</span>
                            </td>
                            <td className="px-3 py-2">
                              {proj ? (
                                <span className="font-mono text-neutral-800">{proj.code}</span>
                              ) : (
                                <span className="text-neutral-400">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-neutral-600 max-w-[200px] truncate" title={m.notes}>
                              {m.notes || "—"}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-neutral-900">
                              {m.balanceAfter !== undefined ? `${num(m.balanceAfter).toLocaleString()} ${viewedItem.unit}` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* CONFIRM DELETE DIALOG */}
      {/* ======================================================== */}
      {deleteItem && (
        <ConfirmDialog
          open
          title="Delete Material Item?"
          message={
            num(deleteItem.reserved) > 0
              ? `Cannot delete "${deleteItem.code} · ${deleteItem.name}" because it currently has ${deleteItem.reserved} ${deleteItem.unit} reserved for active projects.`
              : `Are you sure you want to delete "${deleteItem.code} · ${deleteItem.name}"? All associated movement ledger records will also be removed.`
          }
          onCancel={() => setDeleteItem(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
