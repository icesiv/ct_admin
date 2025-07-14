"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

import { useAuth } from '@/context/AuthContext';

// Type definitions
interface FormData {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
    [key: string]: string | undefined;
}

interface LoginResult {
    success: boolean;
    errors?: FormErrors;
}

export default function SignInForm() {
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: ''
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { login, isAuthenticated, error, clearError, router } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    // useEffect(() => {
    //     // Clear errors when component mounts
    //     clearError();
    // }, [clearError]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear field error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Clear general error
        if (error?.general) {
            clearError();
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormErrors({});

        const result: LoginResult = await login(formData);

        if (result.success) {
            router.push('/dashboard');
        } else {
            setFormErrors(result.errors || {});
        }

        setIsSubmitting(false);
    };

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);

    return (
        <div className="flex flex-col  flex-1 lg:w-1/2 w-full">
            <div className="flex flex-col  justify-center flex-1 w-full max-w-md mx-auto">
            <img
                width={160}
                height={48}
                src="/images/logo/logo.svg"
                alt="Logo"
                className="mb-8 mt-12 md:hidden text-center mx-auto"
            />
                <div className="mb-5 sm:mb-8">
                    <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                        Sign In
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enter your email and password to sign in!
                    </p>
                </div>
                <div>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div>
                                <Label>
                                    Email <span className="text-error-500">*</span>{" "}
                                </Label>
                                <Input
                                    name="email"
                                    defaultValue={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="info@gmail.com"
                                    type="email"
                                />
                                {formErrors.email && (
                                    <p className="mt-1 text-sm text-error-500">{formErrors.email}</p>
                                )}
                            </div>
                            <div>
                                <Label>
                                    Password <span className="text-error-500">*</span>{" "}
                                </Label>
                                <div className="relative">
                                    <Input
                                        name="password"
                                        defaultValue={formData.password}
                                        onChange={handleInputChange}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
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
                                {formErrors.password && (
                                    <p className="mt-1 text-sm text-error-500">{formErrors.password}</p>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                                        Keep me logged in
                                    </span>
                                </div>
                                <Link
                                    href="/reset-password"
                                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            {formErrors.general && (
                                <div className="p-3 text-sm text-error-700 bg-error-50 border border-error-200 rounded-md dark:bg-error-900/20 dark:text-error-300 dark:border-error-800">
                                    {formErrors.general}
                                </div>
                            )}
                            <div>
                                <Button
                                    // type="submit"
                                    className="w-full"
                                    size="sm"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                                </Button>
                            </div>
                        </div>
                    </form>

                    <div className="mt-5">
                        <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                            Don&apos;t have an account? {""}
                            <Link
                                href="/signup"
                                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}