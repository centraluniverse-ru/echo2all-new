import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "100mb",
        },
    }, typescript: {
        ignoreBuildErrors: true
    }
    /* config options here */
};

export default nextConfig;
