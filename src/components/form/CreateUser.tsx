"use client";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";

export default function CreateUserForm() {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className="flex flex-col justify-center flex-1 w-full max-w-xl mx-auto">
            <h3 className="mb-6 font-semibold text-center text-gray-800 dark:text-white/90 text-xl lg:text-2xl">
                Create New Admin/User Account
            </h3>

            <form>
                <div className="space-y-5">
                    {/* <!-- Full Name --> */}
                    <div className="sm:col-span-1">
                        <Label>
                            Full Name<span className="text-error-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Enter your name"
                        />
                    </div>

                    {/* <!--  User Role --> */}
                    <div className="sm:col-span-1">
                        <Label>
                            User Role
                        </Label>
                        <select
                            id="user_role"
                            name="user_role"
                            defaultValue="author"
                            className="h-11 w-full text-center rounded-lg border py-2.5 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 0 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                        >
                            <option value="user">Author</option>
                            <option value="admin">Editor</option>
                            <option value="admin">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* <!-- Email --> */}
                    <div>
                        <Label>
                            Email<span className="text-error-500">*</span>
                        </Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                        />
                    </div>

                    {/* <!-- Password --> */}
                    <div>
                        <Label>
                            Password<span className="text-error-500">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                placeholder="Enter your password"
                                type={showPassword ? "text" : "password"}
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                            >
                                {showPassword ? (
                                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                                ) : (
                                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                                )}
                            </span>
                        </div>

                    </div>

                    <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                        Create User
                    </button>
                </div>
            </form>

        </div>
    );
}