import React from "react";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const TopProfile = () => {
  return (
    <div className="w-full">
      {/* Cover */}
      <div className="w-full h-[35vh] relative overflow-hidden rounded-xl">
        <Image
          src="https://static.vecteezy.com/system/resources/previews/002/297/063/non_2x/abstract-orange-wave-background-free-vector.jpg"
          alt="Profile Cover"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Avatar */}
      <div className="flex justify-center">
        <Avatar className="w-24 h-24 -mt-12 border-4 border-white shadow-md">
          <Image
            src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=900&auto=format&fit=crop&q=60"
            alt="User Avatar"
            fill
            className="object-cover"
          />
        </Avatar>
      </div>

      {/* Profile form */}
      <Card className="mt-8 shadow-sm">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" defaultValue="John Doe" />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="@username"
                defaultValue="@johndoe"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                defaultValue="john@example.com"
              />
            </div>

            {/* Location (пример логичного поля) */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Istanbul, Turkey"
                defaultValue="Istanbul, Turkey"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6 space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell something about yourself..."
              className="min-h-30"
              defaultValue="Healthy lifestyle enthusiast. Founder of a healthy food delivery startup."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end mt-6">
            <Button className="px-8">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopProfile;
