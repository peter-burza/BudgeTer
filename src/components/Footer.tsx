const Footer = () => {


    return (
        <div id="footer" className="bg-[var(--background-2)] text-gray-300 px-6 py-12">
            <div className="flex flex-col md:flex-row justify-center max-w-7xl mx-auto gap-8">

                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">BudgeTer</h2>
                    <p className="text-sm">Track your spending, save smarter, and take control of your financial future.</p>
                </div>

                <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-white mb-3">Connect</h3>
                    <div className="flex space-x-4 mb-4">
                        <a target="blank" href="https://www.linkedin.com/in/peter-burza-695958326/" className="duration-500 hover:text-[var(--color-sky-300)]"><i className="fab fa-linkedin"></i></a>
                        <a target="blank" href="https://github.com/peter-burza/budget-tracker" className="duration-500 hover:text-[var(--color-sky-300)]"><i className="fab fa-github"></i></a>
                    </div>
                </div>
            </div>

            <div className="mt-5 border-t border-gray-700 pt-6 text-center text-gray-500">
                <p className="!text-sm">© 2025 BudgeTer. All rights reserved.</p>
                <p className="!text-sm">Created by <a className="duration-300 hover:text-[var(--color-sky-300)] text-gray-400" target="blank" href="https://peterburzaportfolio.netlify.app">Peter Burza</a></p>
            </div>

        </div>
    )
}

export default Footer