importClass(com.jimplush.goose.Configuration, com.jimplush.goose.ContentExtractor)
importClass(org.apache.commons.lang.StringEscapeUtils)
try {
    importClass(com.google.api.translate.Language)
    importClass(com.google.api.translate.Translate)
} catch(error) {
    application.logger.warning("Google Translate Java API not found: Translation feature unavailable.")
}
document.execute('register/')

var Goose = Goose || function() {
	var Public = {
	    config: null,
	    extractor: null,
		Extractor: function() {
    		this.extract = function(uri, contents, srclang, tlang) {
                try {
                    // use Goose to extract article title and main text

                    var article, top_image
		    if (contents)
		{
		    article = Public.extractor.extractContent(String(uri), String(contents))
		}
		else
		{
		    article = Public.extractor.extractContent(String(uri))
		}
	
		if (article.getTopImage())
		{
			top_image = article.getTopImage().getImageSrc()
		}

                    retval = {
                        "title": String(article.getTitle()), 
                        "text": String(StringEscapeUtils.unescapeHtml(article.getCleanedArticleText())),
                        "top_image": String(top_image),
                    }
                } catch(error) {
                    var log_details = error + ": " + uri
                    application.logger.info(log_details)
                    return log_details
                }
                if (srclang && tlang) {
                    // use Google Translate Java API
                    var title = Public.translate.execute(retval.title, Language.fromString(srclang), Language.fromString(tlang))
                    var text = Public.translate.execute(retval.text, Language.fromString(srclang), Language.fromString(tlang))
                    retval = {
                        "title": String(title),
                        "text": String(text)
                    }
                }
                return retval
    		}
	    }
	}
    // Initialize
    Public.config = register(Configuration, null, {'setEnableImageFetching': true})
    Public.extractor = register(ContentExtractor, Public.config)
    try {
        Public.translate = register(Translate, null, {'setHttpReferrer': application.globals.get('proose.settings.httpReferrer')})
    } catch(error) {
        // Google Translate library is optional
    }
	return Public
}()

