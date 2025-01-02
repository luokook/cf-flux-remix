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
        <h1 className="text-4xl font-extrabold text-white mb-8 text-center">CF Flux Remix</h1>
        <nav>
          <ul className="space-y-4">
            <li>
              <Link
                to="/generate-image"
                className="block w-full text-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                Cloudflare版 Flux AI绘画
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
            
            {/* 
            <li>
              <Link
                to="https://github.com/luokook/CFr2-webdav"
                className="block w-full text-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                Workers+R2 搭建个人免费webdav网盘
              </Link>
            </li>
              */}
            
            <li>
              <Link
                to="https://github.com/luokook/CFr2-webdav"
                className="block w-full text-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                新项目，敬请期待……
              </Link>
            </li>

            <li>
              <Link
                to="/idioms/game"
                className="block w-full text-center px-6 py-4 text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-green-700 rounded-xl transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                看图猜成语游戏
              </Link>
            </li>

            
            {/* 可以在这里添加更多的导航项 */}
            
          </ul>
        </nav>

        <div className="mt-8 text-white text-center border-dashed border-3 border-white-800">
          <h2 className="text-2xl font-bold mt-2 mb-3">系统状态</h2>
          
          <div className="relative">CF-AI状态：
             <span className={`p-1 m-1 text-center rounded-xl border-dashed border-2 border-white-800 
                 ${cfAiStatus === "已连接" ? "bg-green-700" : "bg-red-500"}`}>
                   {cfAiStatus}
              </span>
          </div>
          
          <div className="relative">AI绘画模型：
             <span className={`p-1 m-1 text-center rounded-xl border-dashed border-2 border-white-800 
                 ${configStatus.CUSTOMER_MODEL_MAP === "已设置" ? "bg-green-700" : "bg-red-500"}`}>
               {configStatus.CUSTOMER_MODEL_MAP}
             </span>
            </div>
          
          <div className="relative">翻译模型：
            <span className={`p-1 m-1 text-center rounded-xl border-dashed border-2 border-white-500 bg-indigo-500`}>
              {configStatus.CF_TRANSLATE_MODEL}
            </span>
          </div>
          
          <div className="relative">API Key：
            <span className={`p-1 m-1 text-center rounded-xl border-dashed border-2 border-white-800 
                 ${configStatus.API_KEY === "已设置" ? "bg-green-700" : "bg-red-500"}`}>
              {configStatus.API_KEY}
            </span>
            </div>
          
          <div className="relative">CF账号：
            <span className={`p-1 m-1 text-center rounded-xl border-dashed border-2 border-white-800 
                 ${configStatus.CF_ACCOUNT_LIST === "已设置" ? "bg-green-700" : "bg-red-500"}`}>
              {configStatus.CF_ACCOUNT_LIST}
            </span>
            </div>
          
        </div>
      </div>
    </div>
  );
}
