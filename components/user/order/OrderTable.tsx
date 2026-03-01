"use client";

import React, { useState } from "react";
import Image from "next/image";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { img } from "@/mock-data/products";
import { Separator } from "@/components/ui/separator";

const orders = [
  {
    id: 1,
    customer: "John Doe",
    product: "Healthy Chicken Bowl",
    quantity: 2,
    price: "$24.00",
    date: "2025-01-12",
    status: "Paid",
    image: img,
    description:
      "High-protein chicken bowl with quinoa, avocado and fresh vegetables.",
  },
  {
    id: 2,
    customer: "Anna Smith",
    product: "Vegan Power Salad",
    quantity: 1,
    price: "$14.00",
    date: "2025-01-11",
    status: "Pending",
    image: img,
    description: "Fresh vegan salad with chickpeas, greens and house dressing.",
  },
];

const OrderTable = () => {
  const [selectedOrder, setSelectedOrder] = useState<(typeof orders)[0] | null>(
    null
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT — Orders Table */}
      <Card className="lg:col-span-3 shadow-none">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell>
                    <Avatar className="rounded-md w-16 h-16">
                      <Image
                        src={order.image}
                        alt={order.product}
                        fill
                        className="object-cover"
                      />
                    </Avatar>
                  </TableCell>

                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{order.price}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "Paid" ? "default" : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* RIGHT — Order Details */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-md px-6 py-6">
          {selectedOrder && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="mb-4">
                <SheetTitle className="text-xl font-semibold">
                  Order Details
                </SheetTitle>
              </SheetHeader>

              <Separator className="mb-6" />

              {/* Content */}
              <div className="flex-1 space-y-6 overflow-y-auto">
                {/* Image */}
                <div className="relative w-full h-52 rounded-xl overflow-hidden shadow-sm">
                  <Image
                    src={selectedOrder.image}
                    alt={selectedOrder.product}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product info */}
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold leading-tight">
                    {selectedOrder.product}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedOrder.description}
                  </p>
                </div>

                {/* Details card */}
                <div className="rounded-xl border bg-muted/40 p-4">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Customer</span>
                      <p className="font-medium mt-1">
                        {selectedOrder.customer}
                      </p>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Quantity</span>
                      <p className="font-medium mt-1">
                        {selectedOrder.quantity}
                      </p>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Price</span>
                      <p className="font-medium mt-1">{selectedOrder.price}</p>
                    </div>

                    <div>
                      <span className="text-muted-foreground">Date</span>
                      <p className="font-medium mt-1">{selectedOrder.date}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer / Action */}
              <div className="pt-6">
                <Button className="w-full h-11 text-base rounded-xl">
                  Mark as Completed
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default OrderTable;
