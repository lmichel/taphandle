package servlet;

import java.io.IOException;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.Servlet;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import cart.ZipperJob;

import session.UserTrap;
import uws.UWSException;
import uws.job.JobList;
import uws.service.BasicUWS;
import uws.service.QueuedBasicUWS;
import uws.service.UWSUrl;
import uws.service.UserIdentifier;

/**
 * Servlet implementation class ZipBuilder
 */
public class ZipBuilder extends RootServlet implements Servlet {
	private static final long serialVersionUID = 1L;
	protected BasicUWS<ZipperJob> zipUWS = null;

	/* (non-Javadoc)
	 * @see ajaxservlet.SaadaServlet#init(javax.servlet.ServletConfig)
	 */
	public void init(ServletConfig conf) throws ServletException {
		super.init(conf);
		try {
			zipUWS = new QueuedBasicUWS<ZipperJob>(ZipperJob.class, 2, "/datapack");
			zipUWS.setUserIdentifier(new UserIdentifier() {
				private static final long serialVersionUID = 1L;
			public String extractUserId(UWSUrl urlInterpreter, HttpServletRequest request) throws UWSException {
					return request.getSession().getId();
				}
			});
			zipUWS.addJobList(new JobList<ZipperJob>("zipper")); 
		}catch(UWSException ex){
			throw new ServletException(ex);
		}
	}

	@Override
	public void service(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		try{
//			Pattern datePatt = Pattern.compile(".*\\/download\\/([A-Z0-9])$");
//			Matcher m = datePatt.matcher(req.getRequestURI());		
//			if( m.matches() )
			if( req.getRequestURI().matches(".*\\/download\\/jid[A-Z0-9]*$")) {
				printAccess(req, false);
				logger.info("Download ZIP");
				downloadProduct(req
						, res
						, getServletContext().getRealPath(UserTrap.getUserAccount(req).getZipDownloadPath())
						, "TaphandleCartContent.zip");
			} else {
				System.setProperty("application.realpath", this.getServletContext().getRealPath("/"));
				printAccess(req, false);
				/*
				 * JEE session cannot be used when cookies are disabled
				 */
				zipUWS.setUserIdentifier(new UserIdentifier() {
					private static final long serialVersionUID = 1L;
					public String extractUserId(UWSUrl arg0, HttpServletRequest request)
							throws UWSException {
						try {
							logger.info("Take  " + UserTrap.getUserAccount(request).sessionID + " as user identifer");
							return UserTrap.getUserAccount(request).sessionID;
						} catch (Exception e) {
							throw new UWSException(e.getMessage());
						}
					}
				});
				zipUWS.executeRequest(req, res);
				logger.info(zipUWS.getUserIdentifier() + ": " + zipUWS.getJobList("zipper").getNbJobs()+" jobs");
			}
		}catch(Exception ex){
			System.out.println("Exxxxxxxxxxxxxxxxxxxx");
			this.reportJsonError(req, res, ex);
		}
	}}
