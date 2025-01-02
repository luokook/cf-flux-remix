import { json, AppLoadContext, type LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { createAppContext } from "../context";
import { AppError } from "../utils/error";

export const loader: LoaderFunction = async ({ context }: { context: AppLoadContext }) => {
  console.log("Loader started");
  const appContext = createAppContext(context);
  const { imageGenerationService, config } = appContext;

  let cfAiStatus = "未连接";
  let configStatus = {
    API_KEY: config.API_KEY ? "已设置" : "未设置",
    CF_TRANSLATE_MODEL: config.CF_TRANSLATE_MODEL,
    CF_ACCOUNT_LIST: config.CF_ACCOUNT_LIST.length > 0 ? "已设置" : "未设置",
    CUSTOMER_MODEL_MAP: Object.keys(config.CUSTOMER_MODEL_MAP).length > 0 ? "已设置" : "未设置",
  };

  try {
    await imageGenerationService.testCfAiConnection();
    cfAiStatus = "已连接";
  } catch (error) {
    console.error("CF AI 连接测试失败:", error);
    cfAiStatus = error instanceof AppError ? `连接失败: ${error.message}` : "连接失败: 未知错误";
  }

  console.log("Loader completed");
  return json({ cfAiStatus, configStatus });
};

export default function Index() {
  const { cfAiStatus, configStatus } = useLoaderData<typeof loader>();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 via-green-500 to-blue-500">
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-xl w-full">
        <h1 className="text-4xl font-extrabold text-white mb-8 text-center">AI 宇宙</h1>
        <nav>
          <ul className="space-y-4">
            <li>
              <Link
                to="/generate-image"
                className="block w-full text-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                AI绘画
              </Link>
            </li>
  {/*
            <li>
              <Link
                to="/imagetotext"
                className="block w-full text-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                图像识别(图像转文字)
              </Link>
             </li>  
            
            <li>
              <Link
                to="/chat"
                className="block w-full text-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                AI对话
              </Link>
            </li>
            <li>
              <Link
                to="/texttostadio"
                className="block w-full text-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                文字转语音
              </Link>
            </li>
            <li>
              <Link
                to="/stadiototext"
                className="block w-full text-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                语音识别(语音转文字)
              </Link>
            </li>
    */}
            <li>
              <Link
                to="/translation"
                className="block w-full text-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                AI翻译
              </Link>
            </li>

            <li>
              <Link
                to="https://github.com/luokook"
                className="block w-full text-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                新项目，敬请期待……
              </Link>
            </li>

            <li>
              <Link
                to="https://github.com/luokook/cf-flux-remix"
                className="block w-full text-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                访问 Github 项目
              </Link>
            </li>

            
            {/* 可以在这里添加更多的导航项 */}
            
          </ul>
        </nav>

        <div className="rounded-xl border-dashed border-2 border-white-800 mt-8 text-white justify-center text-center">
          <h2 className="text-2xl font-bold mt-2 mb-3">系统状态</h2>
          
          <div className="flex justify-center m-0.5">CF-AI状态：
             <div className={`flex p-1 text-center rounded-full border-dashed border-2 border-white-800 
                 ${cfAiStatus === "已连接" ? "bg-green-700" : "bg-red-500"}`}>
                   {cfAiStatus}
              </div>
          </div>
          
          <div className="flex justify-center m-0.5">AI绘画模型：
             <div className={`flex p-1 text-center rounded-full border-dashed border-2 border-white-800 
                 ${configStatus.CUSTOMER_MODEL_MAP === "已设置" ? "bg-green-700" : "bg-red-500"}`}>
               {configStatus.CUSTOMER_MODEL_MAP}
             </div>
            </div>
          
          <div className="flex justify-center m-0.5">翻译模型：
            <div className={`flex p-1 text-center rounded-full border-dashed border-2 border-white-500 bg-blue-500`}>
              {configStatus.CF_TRANSLATE_MODEL}
            </div>
          </div>
          
          <div className="flex justify-center m-0.5">API Key：
            <div className={`flex p-1 text-center rounded-full border-dashed border-2 border-white-800 
                 ${configStatus.API_KEY === "已设置" ? "bg-green-700" : "bg-red-500"}`}>
              {configStatus.API_KEY}
            </div>
            </div>
          
          <div className="flex justify-center m-0.5">CF账号：
            <div className={`flex p-1 text-center rounded-full border-dashed border-2 border-white-800 
                 ${configStatus.CF_ACCOUNT_LIST === "已设置" ? "bg-green-700" : "bg-red-500"}`}>
              {configStatus.CF_ACCOUNT_LIST}
            </div>
            </div>
          
        </div>
      </div>
    </div>
  );
}
