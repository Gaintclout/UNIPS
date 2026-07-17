function Logo(){

return(<div className="flex items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="w-8 h-1 bg-teal-600 rounded"></div>
                <div className="w-12 h-1 bg-teal-600 rounded"></div>
                <div className="w-6 h-1 bg-teal-600 rounded"></div>
                <div className="w-10 h-1 bg-teal-600 rounded"></div>
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-wide text-slate-900">
                  UNIPS
                </h1>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Urban Noise Intelligence & Prediction System

                </p>
              </div>
            </div>)
}

export default Logo;