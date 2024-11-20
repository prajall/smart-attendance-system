"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import imageCompression from "browser-image-compression";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type StudentFormData = {
  name: string;
  idNumber: string;
  email: string;
  phone: string;
  section: string;
  courseRef: string;
  batch: number;
  dateOfBirth: string;
  contactNo: string;
  photoUrl: string;
  guardianName: string;
  guardianContact: string;
};

export default function StudentRegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<StudentFormData>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(true);
  useEffect(() => {
    toast.success("Testing toast");
  }, []);
  const onSubmit = async (data: StudentFormData) => {
    try {
      setIsSubmitting(true);
      const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
      let imageUrl = "";

      if (image) {
        if (!validImageTypes.includes(image.type)) {
          toast.error(
            "Invalid image type. Only JPEG, JPG, and PNG are allowed."
          );
          return;
        }

        const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL;
        const cloudinaryPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

        // Compress image
        const compressionOptions = {
          maxSizeMB: 0.3,
          useWebWorker: true,
        };

        const compressedImage = await imageCompression(
          image,
          compressionOptions
        );

        // Upload to Cloudinary
        const imageFormData = new FormData();
        imageFormData.append("file", compressedImage);
        imageFormData.append("upload_preset", cloudinaryPreset!);
        imageFormData.append("api_key", "993734845948435");

        const uploadResponse = await axios.post(cloudinaryUrl!, imageFormData);
        if (uploadResponse.status === 200) {
          imageUrl = uploadResponse.data.secure_url;
        } else {
          throw new Error("Failed to upload image");
        }
      }

      // Prepare payload with image URL
      const dataPayload = {
        ...data,
        photoUrl: imageUrl,
      };

      // Submit the form
      const response = await toast.promise(
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/student`, dataPayload, {
          headers: {
            apiKey: 123456789,
          },
          withCredentials: true,
        }),
        {
          pending: "Adding new Student...",
          success: "Student Added successfully",
          error: "Failed to add student",
        }
      );

      if (response.status === 200) {
        reset();
        window.location.reload();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Student Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              id="idNumber"
              {...register("idNumber", { required: "ID Number is required" })}
            />
            {errors.idNumber && (
              <p className="text-red-500 text-sm">{errors.idNumber.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </div>

          <div>
            <Label htmlFor="section">Section</Label>
            <Select onValueChange={(value) => setValue("section", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
              </SelectContent>
            </Select>
            {errors.section && (
              <p className="text-red-500 text-sm">{errors.section.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="courseRef">Course Reference</Label>
            <Input
              id="courseRef"
              {...register("courseRef", {
                required: "Course Reference is required",
              })}
            />
            {errors.courseRef && (
              <p className="text-red-500 text-sm">{errors.courseRef.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="batch">Batch</Label>
            <Input
              id="batch"
              type="number"
              {...register("batch", { required: "Batch is required" })}
            />
            {errors.batch && (
              <p className="text-red-500 text-sm">{errors.batch.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              {...register("dateOfBirth", {
                required: "Date of Birth is required",
              })}
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-sm">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="contactNo">Contact Number</Label>
            <Input
              id="contactNo"
              {...register("contactNo", {
                required: "Contact Number is required",
              })}
            />
            {errors.contactNo && (
              <p className="text-red-500 text-sm">{errors.contactNo.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="photo">Photo</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              {...register("photoUrl", { required: "Photo is required" })}
              onChange={handleImageChange}
            />
            {errors.photoUrl && (
              <p className="text-red-500 text-sm">{errors.photoUrl.message}</p>
            )}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 w-32 h-32 object-cover rounded"
              />
            )}
          </div>

          <div>
            <Label htmlFor="guardianName">Guardian Name</Label>
            <Input
              id="guardianName"
              {...register("guardianName", {
                required: "Guardian Name is required",
              })}
            />
            {errors.guardianName && (
              <p className="text-red-500 text-sm">
                {errors.guardianName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="guardianContact">Guardian Contact</Label>
            <Input
              id="guardianContact"
              {...register("guardianContact", {
                required: "Guardian Contact is required",
              })}
            />
            {errors.guardianContact && (
              <p className="text-red-500 text-sm">
                {errors.guardianContact.message}
              </p>
            )}
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Registering
                  </>
                ) : (
                  "Register Student"
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Confirm Registration</DialogTitle>
              <DialogDescription>
                Are you sure you want to register this student?
              </DialogDescription>
              <DialogFooter>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  Confirm
                </Button>
                <Button variant="secondary">Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </form>
      </CardContent>
    </Card>
  );
}
